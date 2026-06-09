import { Controller, Get, Param, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/dashboard')
  async getDashboard(@Param('id') userId: string) {
    return this.usersService.getDashboardData(userId);
  }

  @Post(':id/solve')
  async solveProblem(
    @Param('id') userId: string,
    @Body('problemId') problemId: string,
    @Body('language') language: string,
    @Body('code') code: string,
    @Body('status') status: 'ACCEPTED' | 'WRONG_ANSWER',
  ) {
    if (!problemId || !language || !code || !status) {
      throw new BadRequestException('Missing completion parameters');
    }
    return this.usersService.recordSolved(userId, problemId, language, code, status);
  }
}
