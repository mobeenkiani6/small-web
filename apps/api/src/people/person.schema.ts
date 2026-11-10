import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ timestamps: true })
export class Person {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: false })
  isAuthor!: boolean;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
