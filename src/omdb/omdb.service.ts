import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { error } from 'console';

@Injectable()
export class OmdbService {
  private readonly apikey = process.env.OMDB_API_KEY;
  private readonly baseUrl = 'http://www.omdbapi.com';

  async searchMovie(title: string) {
    const response = await axios.get(this.baseUrl, {
      params: {
        t: title,
        apikey: this.apikey,
      },
    });

    const m = response.data;

    if (m.Response === 'False') {
      return { error: 'Filme não encontrado' };
    }

    const actors = m.Actors
      ? m.Actors.split(',')
          .slice(0, 3)
          .map((a: string) => a.trim())
      : [];

    return {
      title: m.Title,
      poster: m.Poster,
      year: m.Year,
      rating: m.imdbRating,
      director: m.Director,
      runtime: m.Runtime,
      plot: m.Plot,
      actors,
    };
  }
}
