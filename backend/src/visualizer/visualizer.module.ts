import { Module } from '@nestjs/common';
import { VisualizerService } from './visualizer.service';
import { VisualizerController } from './visualizer.controller';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  controllers: [VisualizerController],
  providers: [VisualizerService],
  exports: [VisualizerService],
})
export class VisualizerModule {}
