import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  async getProblems(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: 'EASY' | 'MEDIUM' | 'HARD',
    @Query('sheet') sheet?: string,
  ) {
    return this.problemsService.findAll({ category, difficulty, sheet });
  }

  @Get('roadmaps')
  async getRoadmaps() {
    return this.problemsService.getRoadmaps();
  }

  @Get(':slug')
  async getProblem(@Param('slug') slug: string) {
    return this.problemsService.findOne(slug);
  }
}
