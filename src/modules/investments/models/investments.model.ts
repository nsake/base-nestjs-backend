import { omit } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { User } from 'src/modules/users/users.model';

export type InvestmentDocument = Investment & Document;

@Schema({
  timestamps: true,
  collection: 'investments',
  toJSON: {
    transform(doc, ret) {
      ret.id = doc._id.toString();

      return omit(ret, ['_id', '__v']);
    },
  },

  toObject: { virtuals: true },
})
export class Investment {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidV4();
    },
  })
  _id: string;

  @Prop({
    type: String,
    ref: User.name,
  })
  @Type(() => User)
  user: User;

  @Prop({ default: 0.0 })
  amount: number;

  @Prop()
  currency: string;

  @Prop()
  percentage_rate: string;

  @Prop()
  last_accrual_date: string;

  @Prop()
  month: number;

  @Prop()
  year: number;

  @Prop()
  createdAt: Date;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
