import { Injectable } from '@nestjs/common';
import { GroqService } from '../groq/groq.service';
import { OmdbService } from '../omdb/omdb.service';

@Injectable()
export class QuizService {
  constructor(
    private readonly groqService: GroqService,
    private readonly omdbService: OmdbService,
  ) {}

  async recommend(answers: Record<string, string>) {
    const movieTitle = await this.groqService.suggestMovie(answers);
    const movie = await this.omdbService.searchMovie(movieTitle);

    return {
      suggestedBy: movieTitle,
      ...movie,
    };
  }
}