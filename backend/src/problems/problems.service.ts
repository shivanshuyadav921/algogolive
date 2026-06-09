import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { category?: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD'; sheet?: string }) {
    const where: any = {};
    if (query?.category) {
      where.category = query.category;
    }
    if (query?.difficulty) {
      where.difficulty = query.difficulty;
    }
    if (query?.sheet) {
      if (query.sheet === 'neetcode') where.neetcodeSheet = true;
      if (query.sheet === 'blind75') where.blind75Sheet = true;
      if (query.sheet === 'grind169') where.grind169Sheet = true;
    }

    return this.prisma.problem.findMany({
      where,
      include: {
        starterCodes: {
          select: {
            language: true,
          },
        },
      },
    });
  }

  async findOne(slug: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { slug },
      include: {
        starterCodes: true,
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with slug '${slug}' not found`);
    }

    return problem;
  }

  async getRoadmaps() {
    const neetcodeCount = await this.prisma.problem.count({ where: { neetcodeSheet: true } });
    const blind75Count = await this.prisma.problem.count({ where: { blind75Sheet: true } });
    const grind169Count = await this.prisma.problem.count({ where: { grind169Sheet: true } });

    return {
      neetcode150: {
        title: 'NeetCode 150',
        description: 'Complete NeetCode 150 practice sheet matching modern FAANG questions.',
        totalProblems: neetcodeCount,
      },
      blind75: {
        title: 'Blind 75',
        description: 'The classic curated list of top 75 LeetCode exercises.',
        totalProblems: blind75Count,
      },
      grind169: {
        title: 'Grind 169',
        description: 'Advanced progression sheet building on Blind 75.',
        totalProblems: grind169Count,
      },
    };
  }
}
