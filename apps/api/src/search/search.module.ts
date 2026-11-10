import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from '../sites/site.schema';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
