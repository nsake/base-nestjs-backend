import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UserModule } from '..//users/users.module';
import { TokensService } from './tokens.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './auth.strategies';
import { AwsModule } from '../helpers/aws/aws.module';
import { TwoFaController } from './2fa.controller';
import { TwoFaService } from './2fa.service';
import { EmailModule } from '../helpers/email/email.module';

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

    AwsModule,
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController, TwoFaController],
  providers: [
    AuthService,
    TwoFaService,
    TokensService,

    // LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
