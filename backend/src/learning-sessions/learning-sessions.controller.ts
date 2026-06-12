import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateLearningSessionDto } from './dto/create-learning-session.dto';
import { UpdateLearningSessionDto } from './dto/update-learning-session.dto';
import { LearningSessionsService } from './learning-sessions.service';

@Controller('learning-sessions')
export class LearningSessionsController {
  constructor(private readonly sessions: LearningSessionsService) {}

  @Post()
  create(@Body() input: CreateLearningSessionDto) {
    return this.sessions.create(input);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessions.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() input: UpdateLearningSessionDto,
  ) {
    return this.sessions.update(id, input);
  }
}
