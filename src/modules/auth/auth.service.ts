import {
  Injectable,
  BadRequestException,
  NotAcceptableException,
  ForbiddenException,
} from '@nestjs/common';

import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateByOwnerDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async initUser(createUserDto: any) {
    const userExists = await this.usersService.findByEmail(createUserDto.email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await this.hashData(createUserDto.password);
    await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
  }

  async createByOwner(createUserDto: CreateByOwnerDto) {
    const userExists = await this.usersService.findByEmail(createUserDto.email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await this.hashData(createUserDto.password);
    await this.usersService.create({
      ...createUserDto,
      password: hash,
      status: createUserDto.status ? 'active' : 'confirmation',
    });
  }

  async editPassword(userId: string, payload: any) {
    const password = await this.hashData(payload.password);

    await this.usersService.update(userId, { password });
  }

  async generateTokensAndUpdate(user) {
    const tokens = await this.generateTokens(user._id, user.email);
    await this.updateRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  async signIn(data: any) {
    const user = await this.usersService.findByEmailAndGetRole(data.email);

    if (!user) throw new BadRequestException('User does not exist');

    if (user.status !== 'active')
      throw new NotAcceptableException('User is not confirmed');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    const tokens = await this.generateTokens(user._id, user.email);
    await this.updateRefreshToken(user._id, tokens.refreshToken);

    // if (!user.role)
    //   throw new NotAcceptableException('You are not assigned to any role yet');

    return {
      ...tokens,
      tag: user.tag,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      rules: user.role?.rules,
      telegram: user.telegram,
    };
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  async validateUser(payload) {
    return this.usersService.findByEmailAndGetRole(payload.email);
  }

  async validateUserById(userId: string) {
    const user = await this.usersService.findByIdAndGetRole(userId);

    return {
      tag: user.tag,
      role: user.role.name,
      roleLabel: user.role.label,
      rules: user.role.rules,
      name: user.name,
      email: user.email,
      surname: user.surname,
      telegram: user.telegram,
      createdAt: user.created_at,
      ...(user?.avatarUrl && { avatarUrl: user?.avatarUrl }),
      ...(user?.keitaro_user && {
        keitaro_user: (user?.keitaro_user as any)?._id,
      }),
      ...(user?.keitaro_user && {
        keitaro_user_populated: user?.keitaro_user,
      }),
    };
  }

  async getFullUserById(userId: string) {
    const user = await this.usersService.findByIdAndGetRole(userId);

    return user;
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(userId, user.email);

    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '6h',
        },
      ),

      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
