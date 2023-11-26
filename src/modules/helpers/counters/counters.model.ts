import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CountersDocument = Counters & Document;

export type TCountersName = 'user';

@Schema({
  collection: 'counters',
  timestamps: true,
  toObject: { virtuals: true },
})
export class Counters {
  @Prop({ default: 1 })
  user: number;
}

export const CountersSchema = SchemaFactory.createForClass(Counters);
