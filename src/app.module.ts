import { join } from 'path';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './users/user/user.module';
import { LoginService } from './login/login.service';
import { LoginModule } from './login/login.module';
import { ItemsModule } from './items/items.module';
import { ChallengesModule } from './challenges/challenges.module';
import { HealthController } from './health.controller';
import { ResourceGateway } from './resource/resource.gateway';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PerformanceMiddleware } from './performance/performance.middleware';
import { AdminModule } from './admin/admin.module';
import { AssetsModule } from './assets/assets.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', '..', 'public')}), ScheduleModule.forRoot(), PrismaModule, UserModule, LoginModule, ItemsModule, ChallengesModule, AdminModule, AssetsModule, StatsModule],
  providers: [LoginService, ResourceGateway],
  controllers: [HealthController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PerformanceMiddleware).forRoutes("*");
  }
}
