import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './auth.dto';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokensService,
  ) {}

  async initUserAndAuth(credentials: SignUpDto) {
    const duplicated = await this.userService.findWithQuery({
      $or: [{ phone: credentials.phone }, { email: credentials.email }],
    });

    if (duplicated)
      throw new BadRequestException(
        'Such phone number or email is already exists',
      );

    const user = await this.userService.create(credentials);

    return this.tokenService.generateTokens(user.id, user.email);
  }
}
