import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeopleModule } from './people/people.module';
import { SitesModule } from './sites/sites.module';
import { VisitsModule } from './visits/visits.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    PeopleModule,
    SitesModule,
    VisitsModule,
    SearchModule,
  ],
})
export class AppModule {}
