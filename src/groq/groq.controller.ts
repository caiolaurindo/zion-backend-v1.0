import { Controller, Post, Body } from '@nestjs/common';
import { GroqService } from './groq.service';

@Controller('groq')
export class GroqController {
  constructor(private readonly groqService: GroqService) {}

  @Post('suggest')
  async suggest(@Body() answers: Record<string, string>) {
    return this.groqService.suggestMovie(answers);
  }
}