import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import {
  AccessTokenStrategy,
  LocalStrategy,
  RefreshTokenStrategy,
} from './auth.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UserSchema } from '../users/users.model';
import { UserModule } from '..//users/users.module';
import { UsersService } from '../users/users.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/infrastructure/config/configuration';
import { Card, CardSchema } from '../users/cards/cards.model';
import { Role, RoleSchema } from '../roles/roles.model';
import { CountersModule } from '../counters.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    AwsModule,
    UserModule,
    CountersModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    JwtModule.register({}),

    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      {
        name: Card.name,
        schema: CardSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,

    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
