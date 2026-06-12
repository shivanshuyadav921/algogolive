import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VisualizerService } from './visualizer.service';
import { ParseInputDto } from './dto/parse-input.dto';

@Controller('visualizer')
export class VisualizerController {
  constructor(private readonly visualizerService: VisualizerService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseInput(@Body() body: ParseInputDto) {
    return this.visualizerService.processInput(body.query);
  }
}
