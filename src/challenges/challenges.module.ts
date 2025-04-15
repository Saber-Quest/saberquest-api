import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { ChallengesSocketService } from './challenges.websocket';

@Module({
  controllers: [ChallengesController],
  providers: [ChallengesService, ChallengesSocketService]
})
export class ChallengesModule {}
