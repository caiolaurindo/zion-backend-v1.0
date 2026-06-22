import { Controller, Post, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('recommend')
  async recommend(@Body() answers: Record<string, string>) {
    return this.quizService.recommend(answers);
  }
}