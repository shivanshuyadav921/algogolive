import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningSessionDto } from './dto/create-learning-session.dto';
import { UpdateLearningSessionDto } from './dto/update-learning-session.dto';

@Injectable()
export class LearningSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateLearningSessionDto) {
    return this.prisma.learningSession.create({
      data: {
        rawQuery: input.rawQuery,
        result: input.result as Prisma.InputJsonValue,
        userId: input.userId,
      },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.learningSession.findUnique({
      where: { id },
    });
    if (!session) {
      throw new NotFoundException(`Learning session '${id}' was not found`);
    }
    return session;
  }

  async update(id: string, input: UpdateLearningSessionDto) {
    await this.findOne(id);
    return this.prisma.learningSession.update({
      where: { id },
      data: {
        currentStep: input.currentStep,
        revealedHints: input.revealedHints,
        codeDrafts: input.codeDrafts as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
