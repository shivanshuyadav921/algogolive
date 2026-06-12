import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { FeedbackService } from '../feedback/feedback.service';

@Module({
  controllers: [SandboxController],
  providers: [SandboxService, FeedbackService],
  exports: [SandboxService],
})
export class SandboxModule {}
