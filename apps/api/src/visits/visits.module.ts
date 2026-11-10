import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Visit, VisitSchema } from './visit.schema';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { PeopleModule } from '../people/people.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }]),
    PeopleModule,
  ],
  providers: [VisitsService],
  controllers: [VisitsController],
  exports: [VisitsService, MongooseModule],
})
export class VisitsModule {}
