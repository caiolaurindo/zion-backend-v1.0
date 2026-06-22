import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('recommend')
  @UseGuards(AuthGuard)
  async recommend(@Body() answers: Record<string, string>, @Req() req: any) {
    return this.quizService.recommend(answers, req.user.sub);
  }
}