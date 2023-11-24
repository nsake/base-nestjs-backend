import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Param,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateByOwnerDto, RegisterDto } from './auth.dto';
import { SchemaValidationPipe } from 'src/infrastructure/pipes/schema_validation.pipe';
import { RefreshTokenGuard } from 'src/infrastructure/guards/refresh_token.guard';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { CurrentUser } from 'src/infrastructure/decorators/current-user.decorator';
import { OwnerGuard } from 'src/infrastructure/guards/owner.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@Body() payload) {
    return this.authService.signIn(payload);
  }

  @UseGuards(AccessTokenGuard)
  @Get('handle-full-user')
  async getFullUser(@CurrentUser('id') userId: string) {
    return this.authService.getFullUserById(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('handle-user')
  async get(@CurrentUser('id') userId: string) {
    return this.authService.validateUserById(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('handle-exact-user/:userId')
  async getExactUser(@Param('userId') userId: string) {
    return this.authService.validateUserById(userId);
  }

  @Post('init')
  async register(
    @Body(new SchemaValidationPipe(RegisterDto)) payload: RegisterDto,
  ) {
    return this.authService.initUser(payload);
  }

  @UseGuards(OwnerGuard)
  @Post('create-by-owner')
  async create(
    @Body(new SchemaValidationPipe(CreateByOwnerDto)) payload: CreateByOwnerDto,
  ) {
    return this.authService.createByOwner(payload);
  }

  @UseGuards(OwnerGuard)
  @Patch('edit-password')
  edit(@CurrentUser('id') userId: string, @Body() payload: any) {
    return this.authService.editPassword(userId, payload);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: any) {
    const refreshToken = req.headers['authorization']
      .replace('Bearer', '')
      .trim();

    return this.authService.refreshTokens(req.user.id, refreshToken);
  }
}
