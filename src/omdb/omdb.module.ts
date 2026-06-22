import { Module } from '@nestjs/common';
import { OmdbController } from './omdb.controller';
import { OmdbService } from './omdb.service';

@Module({
  controllers: [OmdbController],
  providers: [OmdbService],
  exports : [OmdbService]
})
export class OmdbModule {}
