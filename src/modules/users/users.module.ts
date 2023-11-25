import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { User, UserSchema } from './users.model';
import { Password } from 'src/infrastructure/utils/password.util';
import { CountersModule } from '../helpers/counters/counters.module';

@Module({
  imports: [
    CountersModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;

          schema.pre('save', async function () {
            if (this.isModified('password')) {
              const hash = await Password.toHash(this.get('password'));
              this.set('password', hash);
            }
          });

          return schema;
        },
      },
    ]),
  ],
  exports: [UsersService],
  providers: [UsersService],
})
export class UserModule {}
