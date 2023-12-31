import { omit } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { EUserRole } from 'src/infrastructure/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform(doc, ret) {
      ret.id = doc._id.toString();

      return omit(ret, ['_id', '__v']);
    },
  },

  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidV4();
    },
  })
  _id: string;

  @Prop()
  userId: number;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  telegram: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ default: null, select: false })
  kycSelfie?: string;

  @Prop({ type: String, enum: EUserRole })
  role: EUserRole;

  @Prop({ select: false })
  refreshToken: string;

  // Referrals
  @Prop({
    ref: User.name,
    type: [mongoose.Schema.Types.ObjectId],
    select: false,
  })
  referrals: [User];

  @Prop({
    ref: User.name,
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    select: false,
  })
  parentReferral: User;

  // TwoFa
  @Prop({ nullable: true, select: false })
  twoFactorAuthSecret?: string;

  @Prop({ nullable: true, select: false })
  otpUrl?: string;

  // Email
  @Prop({ nullable: true, select: true })
  isEmailConfirmed?: boolean;

  @Prop({ nullable: true, select: false })
  emailToken?: string;

  @Prop()
  created_at: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
