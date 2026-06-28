import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthOptionalGuard } from '../auth/auth-optional.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('recommend')
  @UseGuards(AuthOptionalGuard)
  async recommend(@Body() answers: Record<string, string>, @Req() req: any) {
    return this.quizService.recommend(answers, req.user?.sub ?? null);
  }

  @Post('random')
  @UseGuards(AuthOptionalGuard)
  async random(@Body() body: { genre?: string }, @Req() req: any) {
    return this.quizService.random(req.user?.sub ?? null, body.genre ?? null);
  }
}
