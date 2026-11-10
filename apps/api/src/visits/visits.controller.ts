import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Get()
  list(@Query('personId') personId: string) {
    return this.visits.forPerson(personId);
  }

  @Post()
  record(@Body() dto: CreateVisitDto) {
    return this.visits.record(dto);
  }
}
