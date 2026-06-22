import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(userId: string) {
    return this.prisma.history.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setLike(historyId: string, userId: string, liked: boolean | null) {
    return this.prisma.history.update({
      where: { id: historyId, userId },
      data: { liked },
    });
  }

  async setWatched(historyId: string, userId: string, watched: boolean) {
    return this.prisma.history.update({
      where: { id: historyId, userId },
      data: { watched },
    });
  }
}