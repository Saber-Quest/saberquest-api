import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserAdmin } from './dto/update-user.dto';
import { verifyToken } from 'src/util/jwt';

@Injectable()
export class AdminService {
    constructor (private readonly prisma: PrismaService) {}

    async updateUser(auth: string, body: UpdateUserAdmin) {
        const admin = verifyToken(auth.split(" ")[1]);

        if (!admin || admin.exp < Date.now()) throw new UnauthorizedException();

        const isAdmin = await this.prisma.user.findFirst({
            where: {
                id: admin.id,
                admin: true
            }
        });

        if (!isAdmin) throw new ForbiddenException();

        await this.prisma.user.update({
            where: { id: body.user },
            data: { [body.property]: body.value }
        });

        return;
    }

    async deleteUser(auth: string, userId: string) {
        const admin = verifyToken(auth.split(" ")[1]);

        if (!admin || admin.exp < Date.now()) throw new UnauthorizedException();

        const isAdmin = await this.prisma.user.findFirst({
            where: {
                id: admin.id,
                admin: true
            }
        });

        if (!isAdmin) throw new ForbiddenException();

        await this.prisma.user.delete({
            where: { id: userId }
        }).then(u => {
            if (!u) {
                throw new NotFoundException();
            }
            return;
        })
    }
}
