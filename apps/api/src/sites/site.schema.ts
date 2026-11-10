import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: true })
export class Site {
  /** Canonical address, e.g. tidepool.zz — unique key for the small web. */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  address!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  /** Sanitized HTML body stored as published. */
  @Prop({ required: true })
  html!: string;

  /** Plain text extracted for search. */
  @Prop({ required: true, default: '' })
  text!: string;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  author!: Types.ObjectId;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ text: 'text', title: 'text', address: 'text' });
