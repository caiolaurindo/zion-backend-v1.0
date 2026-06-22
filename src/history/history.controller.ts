import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { HistoryService } from './history.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async getHistory(@Req() req: any) {
    return this.historyService.getHistory(req.user.sub);
  }

  @Patch(':id/like')
  async like(@Param('id') id: string, @Body() body: { liked: boolean | null }, @Req() req: any) {
    return this.historyService.setLike(id, req.user.sub, body.liked);
  }

  @Patch(':id/watched')
  async watched(@Param('id') id: string, @Body() body: { watched: boolean }, @Req() req: any) {
    return this.historyService.setWatched(id, req.user.sub, body.watched);
  }
}