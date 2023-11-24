import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from './users.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

//
import { Role, RoleSchema } from '../roles/roles.model';
import { CountersModule } from '../counters.module';

@Module({
  imports: [
    CountersModule,
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UserModule {}
