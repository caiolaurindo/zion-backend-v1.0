import { Controller, Get, Query } from '@nestjs/common';
import { OmdbService } from './omdb.service';

@Controller('omdb')
export class OmdbController {
  constructor(private readonly omdbService: OmdbService) {}

  @Get('search')
  async search(@Query('title') title: string) {
    return this.omdbService.searchMovie(title);
  }
}