import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VisualizerService } from './visualizer.service';

@Controller('visualizer')
export class VisualizerController {
  constructor(private readonly visualizerService: VisualizerService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseInput(@Body('query') query: string) {
    return this.visualizerService.processInput(query);
  }
}
