import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotes(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      include: {
        problem: {
          select: {
            title: true,
            slug: true,
            difficulty: true,
            category: true,
          },
        },
      },
    });
  }

  async saveNote(userId: string, problemId: string, content: string) {
    return this.prisma.note.upsert({
      where: {
        userId_problemId: { userId, problemId },
      },
      update: {
        content,
      },
      create: {
        userId,
        problemId,
        content,
      },
    });
  }

  async deleteNote(userId: string, problemId: string) {
    const note = await this.prisma.note.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.delete({
      where: { userId_problemId: { userId, problemId } },
    });
  }

  async toggleBookmark(userId: string, problemId: string) {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    const isBookmarked = progress ? progress.bookmarked : false;

    return this.prisma.userProgress.upsert({
      where: {
        userId_problemId: { userId, problemId },
      },
      update: {
        bookmarked: !isBookmarked,
      },
      create: {
        userId,
        problemId,
        bookmarked: true,
      },
    });
  }
}
