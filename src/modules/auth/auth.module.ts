import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UserModule } from '..//users/users.module';
import { TokensService } from './tokens.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './auth.strategies';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),

    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,

    // LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
