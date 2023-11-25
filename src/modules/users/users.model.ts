import { omit } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

//! //
//!
//!  Add roles module for custom (ask)
//!  Add aws module for media streaming
//!  Add counter module
//!  Search options
//!  Finish auth module (socket + https, refactor for fastify(?) )
//!  Add pipe for verification and validation fields
//!
//! //

import { EUserRole } from 'src/infrastructure/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
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

  @Prop()
  passwordHash: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ type: String, enum: EUserRole })
  role: EUserRole;

  @Prop()
  refreshToken: string;

  @Prop({
    ref: User.name,
    type: [mongoose.Schema.Types.ObjectId],
  })
  referrals: [User];

  @Prop({
    ref: User.name,
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  })
  parentReferral: User;

  @Prop({ nullable: true })
  twoFactorAuthSecret?: string;

  @Prop()
  created_at: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
