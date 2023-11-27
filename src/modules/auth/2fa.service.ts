import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

import { authenticator } from 'otplib';

@Injectable()
export class TwoFaService {
  constructor(private userService: UsersService) {}

  async generateOtpAuth(userId: string) {
    const user = await this.userService
      .findById(userId)
      .select('kycSelfie')
      .select('twoFactorAuthSecret')
      .select('email');

    if (!user.kycSelfie)
      throw new ForbiddenException('KYC selfie should be provided first');

    if (user.twoFactorAuthSecret)
      throw new ForbiddenException('2FA were already generated');

    console.log(user);

    const secret = authenticator.generateSecret();
    const app_name = process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME;
    const otpAuthUrl = authenticator.keyuri(user.email, app_name, secret);

    await this.userService.findOneByIdAndUpdate(user.id, {
      twoFactorAuthSecret: secret,
      otpUrl: otpAuthUrl,
    });

    return {
      secret,
      otpAuthUrl,
    };
  }

  /**
   * Verifies 2fa code with secret from database
   *
   * @param {string} token code from 2fa app
   * @param {string} secret twoFactorAuthSecret from user entity
   *
   * @return {boolean} true or false
   */

  public verifyTwoFaCode(token: string, secret: string) {
    return authenticator.verify({
      token,
      secret,
    });
  }
}
