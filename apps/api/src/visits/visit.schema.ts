import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

export type VisitMethod =
  | 'typed'
  | 'link'
  | 'back'
  | 'forward'
  | 'history'
  | 'search'
  | 'publish';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true, index: true })
  person!: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  address!: string;

  @Prop({ trim: true, default: '' })
  title!: string;

  @Prop({
    required: true,
    enum: ['typed', 'link', 'back', 'forward', 'history', 'search', 'publish'],
  })
  method!: VisitMethod;

  /** Whether a site existed at this address when visited. */
  @Prop({ required: true, default: false })
  found!: boolean;

  /**
   * Snapshot of HTML at navigation time so back/forward can restore
   * the page that was left, even if the live site changes later.
   */
  @Prop({ default: '' })
  htmlSnapshot!: string;

  @Prop({ required: true })
  visitedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ person: 1, visitedAt: -1 });
