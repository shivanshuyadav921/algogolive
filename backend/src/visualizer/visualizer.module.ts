import { Module } from '@nestjs/common';
import { VisualizerService } from './visualizer.service';
import { VisualizerController } from './visualizer.controller';

@Module({
  controllers: [VisualizerController],
  providers: [VisualizerService],
  exports: [VisualizerService],
})
export class VisualizerModule {}
