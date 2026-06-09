import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: { email: string; name?: string; passwordHash?: string; image?: string }) {
    return this.prisma.user.create({
      data: {
        ...data,
        streak: {
          create: {
            current: 0,
            longest: 0,
          },
        },
      },
    });
  }

  async getDashboardData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        streak: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    // 1. Get user progress
    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: {
        problem: true,
      },
    });

    const solvedProblems = progress.filter(p => p.completed).map(p => p.problem);
    
    // 2. Fetch all problems in system to calculate topic mastery
    const allProblems = await this.prisma.problem.findMany();

    // Group solved and total by category
    const categoryStats: Record<string, { solved: number; total: number }> = {};
    for (const p of allProblems) {
      if (!categoryStats[p.category]) {
        categoryStats[p.category] = { solved: 0, total: 0 };
      }
      categoryStats[p.category].total++;
    }

    for (const p of solvedProblems) {
      if (categoryStats[p.category]) {
        categoryStats[p.category].solved++;
      }
    }

    // Identify weak topics (completion < 50% or least solved, but total > 0)
    const topicMastery = Object.entries(categoryStats).map(([topic, stats]) => ({
      topic,
      percentage: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
      solved: stats.solved,
      total: stats.total,
    }));

    const weakTopics = topicMastery
      .filter(t => t.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage)
      .map(t => t.topic);

    // Recommended problems: Unsolved problems belonging to weak topics
    const recommendedProblems = await this.prisma.problem.findMany({
      where: {
        category: { in: weakTopics.slice(0, 3) },
        userProgress: {
          none: {
            userId,
            completed: true,
          },
        },
      },
      take: 4,
    });

    // 3. Generate heatmap: submissions grouped by date in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const submissions = await this.prisma.submission.findMany({
      where: {
        userId,
        createdAt: { gte: oneYearAgo },
      },
      select: {
        createdAt: true,
      },
    });

    const heatmap: Record<string, number> = {};
    for (const sub of submissions) {
      const dateKey = sub.createdAt.toISOString().split('T')[0];
      heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
    }

    return {
      streak: user.streak || { current: 0, longest: 0 },
      solvedCount: solvedProblems.length,
      totalCount: allProblems.length,
      completionRate: allProblems.length > 0 ? Math.round((solvedProblems.length / allProblems.length) * 100) : 0,
      topicMastery,
      recommendedProblems,
      heatmap,
    };
  }

  async recordSolved(userId: string, problemId: string, language: string, code: string, status: 'ACCEPTED' | 'WRONG_ANSWER') {
    // 1. Log Submission
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        problemId,
        language,
        code,
        status,
        runtime: Math.floor(Math.random() * 80) + 10, // Simulated speed
        memory: Math.floor(Math.random() * 12000) + 4000, // Simulated RAM
      },
    });

    if (status === 'ACCEPTED') {
      // 2. Update progress
      await this.prisma.userProgress.upsert({
        where: {
          userId_problemId: { userId, problemId },
        },
        update: {
          completed: true,
          lastSolved: new Date(),
        },
        create: {
          userId,
          problemId,
          completed: true,
        },
      });

      // 3. Increment streak
      const streak = await this.prisma.streak.findUnique({ where: { userId } });
      if (streak) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const lastActiveDate = new Date(streak.lastActive);
        
        const isSameDay = lastActiveDate.toDateString() === today.toDateString();
        const isConsecutive = lastActiveDate.toDateString() === yesterday.toDateString();

        let newCurrent = streak.current;
        if (!isSameDay) {
          if (isConsecutive || streak.current === 0) {
            newCurrent += 1;
          } else {
            newCurrent = 1; // reset streak if day skipped
          }
        }

        const newLongest = Math.max(newCurrent, streak.longest);

        await this.prisma.streak.update({
          where: { userId },
          data: {
            current: newCurrent,
            longest: newLongest,
            lastActive: today,
          },
        });
      }
    }

    return submission;
  }
}
