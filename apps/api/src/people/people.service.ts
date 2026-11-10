import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './person.schema';
import { CreatePersonDto } from './dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly people: Model<PersonDocument>,
  ) {}

  list() {
    return this.people.find().sort({ name: 1 }).lean().exec();
  }

  findById(id: string) {
    return this.people.findById(id).lean().exec();
  }

  findByName(name: string) {
    return this.people.findOne({ name }).lean().exec();
  }

  async create(dto: CreatePersonDto) {
    const name = dto.name.trim().replace(/\s+/g, ' ');
    if (!name) throw new BadRequestException('Name is required');

    const existing = await this.people.findOne({ name }).lean().exec();
    if (existing) {
      throw new ConflictException(`Someone named "${name}" already exists`);
    }

    const created = await this.people.create({
      name,
      isAuthor: dto.isAuthor ?? true,
    });
    return created.toObject();
  }
}
