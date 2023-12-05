import { Injectable, ForbiddenException } from '@nestjs/common';

import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TEndWithMinutes } from 'src/infrastructure/types/custom.types';

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  public async generateCustomToken(payload: any, expiresIn: TEndWithMinutes) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn,
    });
  }

  public async verifyCustomToken(token: any) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  public async generateTokensAndUpdate(user) {
    const tokens = await this.generateTokens(user._id, user.email);

    await this.updateRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  public async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId).select('refreshToken');

    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(userId, user.email);

    await this.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  // Private methods of token service
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.usersService.findOneByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private hashData(data: string) {
    return argon2.hash(data);
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '100d',
        },
      ),

      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '200d',
        },
      ),
    ]);

    await this.usersService.findOneByIdAndUpdate(userId, { refreshToken });

    return {
      accessToken,
      refreshToken,
    };
  }
}
