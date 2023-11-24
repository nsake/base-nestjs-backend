import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

//! //
//!
//!  Add roles module for custom (ask)
//!  Add aws module for media streaming
//!  Add counter module
//!  Search options
//!  Finish auth module (socket + https, refactor for fastify(?) )
//! //
import { Type } from 'class-transformer';
import { Role } from '../roles/roles.model';

export type UserDocument = User & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toObject: { virtuals: true },
})
export class User {
  @Prop()
  email: string;

  @Prop()
  userId: number;

  @Prop()
  password: string;

  @Prop()
  telegram: string;

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.name,
  })
  @Type(() => Role)
  role: Role;

  @Prop()
  refreshToken: string;

  @Prop({
    ref: 'user',
    type: [mongoose.Schema.Types.ObjectId],
  })
  referrals: [User];

  @Prop()
  created_at: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
