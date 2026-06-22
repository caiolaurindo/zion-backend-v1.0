import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { GroqModule } from '../groq/groq.module';
import { OmdbModule } from '../omdb/omdb.module';

@Module({
  imports: [GroqModule, OmdbModule],
  controllers: [QuizController],
  providers: [QuizService]
})
export class QuizModule {}