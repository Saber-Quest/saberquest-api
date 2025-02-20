import { Injectable, NotFoundException } from '@nestjs/common';
import { getAvatar, getBanner } from 'src/util/images';

@Injectable()
export class AssetsService {
    profilePicture(id: string) {
        const avatar = getAvatar(id);

        if (!avatar) throw new NotFoundException();
        return avatar;
    }

    async banner(id: string, type: string) {
        const banner = await getBanner(id, type);

        if (!banner) throw new NotFoundException();
        return banner;
    }
}
