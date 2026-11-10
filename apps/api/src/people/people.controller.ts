import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto';

@Controller('people')
export class PeopleController {
  constructor(private readonly people: PeopleService) {}

  @Get()
  list() {
    return this.people.list();
  }

  @Post()
  create(@Body() dto: CreatePersonDto) {
    return this.people.create(dto);
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    const person = await this.people.findById(id);
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }
}
