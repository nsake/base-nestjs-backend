import { FastifyRequest } from 'fastify';
import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Req,
  UseInterceptors,
} from '@nestjs/common';

import { SignUpDto } from './auth.dto';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';

import { RefreshTokenGuard } from 'src/infrastructure/guards/refresh_token.guard';
import { CurrentUser } from 'src/infrastructure/decorators/current-user.decorator';
import { File } from 'src/infrastructure/decorators/file-from-request.decorator';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokensService,
  ) {}

  @Post('init-user')
  async initUser(@Body() credentials: SignUpDto) {
    return this.authService.initUserAndAuth(credentials);
  }

  @UseGuards(AccessTokenGuard)
  @Post('upload-kyc-selfie')
  async uploadKYCSelfie(@CurrentUser('id') userId: string, @File() file: File) {
    return this.authService.uploadKYCSelfie(userId, file);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: any) {
    const refreshToken = req.headers['authorization']
      .replace('Bearer', '')
      .trim();

    return this.tokenService.refreshTokens(req.user.id, refreshToken);
  }
}
