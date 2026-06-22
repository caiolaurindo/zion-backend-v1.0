import { Injectable } from '@nestjs/common';
import { GroqService } from '../groq/groq.service';
import { OmdbService } from '../omdb/omdb.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(
    private readonly groqService: GroqService,
    private readonly omdbService: OmdbService,
    private readonly prisma: PrismaService,
  ) {}

  async recommend(answers: Record<string, string>, userId: string | null) {
    let seen: string[] = [];
    let liked: string[] = [];
    let disliked: string[] = [];

    if (userId) {
      // garante que o usuário existe no banco
      await this.prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
        },
      });

      const history = await this.prisma.history.findMany({
        where: { userId },
        include: { movie: true },
      });

      seen = history.map((h) => h.movie.title);
      liked = history.filter((h) => h.liked === true).map((h) => h.movie.title);
      disliked = history
        .filter((h) => h.liked === false)
        .map((h) => h.movie.title);
    }

    const movieTitle = await this.groqService.suggestMovie(answers, {
      seen,
      liked,
      disliked,
    });
    const movie = await this.omdbService.searchMovie(movieTitle);

    if ('error' in movie) {
      return { error: movie.error };
    }

    if (userId) {
      let savedMovie = await this.prisma.movie.findFirst({
        where: { title: movie.title },
      });

      if (!savedMovie) {
        savedMovie = await this.prisma.movie.create({
          data: {
            title: movie.title,
            poster: movie.poster,
            year: movie.year,
            rating: movie.rating,
            director: movie.director,
            runtime: movie.runtime,
            plot: movie.plot,
            actors: movie.actors,
          },
        });
      }

      await this.prisma.history.create({
        data: { userId, movieId: savedMovie.id },
      });
    }

    return {
      suggestedBy: movieTitle,
      ...movie,
    };
  }
}
