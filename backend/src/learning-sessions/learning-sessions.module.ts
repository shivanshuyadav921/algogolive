import { Module } from '@nestjs/common';
import { LearningSessionsController } from './learning-sessions.controller';
import { LearningSessionsService } from './learning-sessions.service';

@Module({
  controllers: [LearningSessionsController],
  providers: [LearningSessionsService],
})
export class LearningSessionsModule {}
