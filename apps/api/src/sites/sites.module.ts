import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from './site.schema';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { PeopleModule } from '../people/people.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
    PeopleModule,
  ],
  providers: [SitesService],
  controllers: [SitesController],
  exports: [SitesService, MongooseModule],
})
export class SitesModule {}
