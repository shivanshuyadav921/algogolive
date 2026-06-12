import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SandboxService } from './sandbox.service';

@Controller('sandbox')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async executeCode(
    @Body('code') code: string,
    @Body('language') language: string,
    @Body('testCases') testCases: Array<{ input: string; output: string }>,
    @Body('pattern') pattern?: string,
  ) {
    return this.sandboxService.runCode({ code, language, testCases, pattern });
  }
}
