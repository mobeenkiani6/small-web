import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit, VisitDocument, VisitMethod } from './visit.schema';
import { CreateVisitDto } from './dto';
import { PeopleService } from '../people/people.service';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visits: Model<VisitDocument>,
    private readonly people: PeopleService,
  ) {}

  async record(dto: CreateVisitDto) {
    const person = await this.people.findById(dto.personId);
    if (!person) throw new NotFoundException('Person not found');

    const created = await this.visits.create({
      person: person._id,
      address: dto.address.trim().toLowerCase(),
      title: dto.title?.trim() ?? '',
      method: dto.method as VisitMethod,
      found: dto.found,
      htmlSnapshot: dto.htmlSnapshot ?? '',
      visitedAt: new Date(),
    });

    return created.toObject();
  }

  async forPerson(personId: string) {
    const person = await this.people.findById(personId);
    if (!person) throw new NotFoundException('Person not found');

    return this.visits
      .find({ person: person._id })
      .sort({ visitedAt: -1 })
      .lean()
      .exec();
  }
}
