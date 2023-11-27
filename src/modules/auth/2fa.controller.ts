import { Post, Controller, Body, UseGuards, Res } from '@nestjs/common';

import { TwoFaService } from './2fa.service';
import { CurrentUser } from 'src/infrastructure/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { VerifyTwoFaCodeDto } from './auth.dto';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { Response } from 'express';
import * as qrcode from 'qrcode';

@Controller('2fa')
export class TwoFaController {
  constructor(
    private twoFaService: TwoFaService,
    private userService: UsersService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('generate-2fa-qr')
  async generateQrCode(
    @Res() response: Response,
    @CurrentUser('id') userId: string,
  ) {
    const { otpAuthUrl } = await this.twoFaService.generateOtpAuth(userId);

    response.type('image/png');

    const qr = await qrcode.toBuffer(otpAuthUrl, {
      type: 'png',
      width: 200,
      errorCorrectionLevel: 'H',
    });

    response.send(qr);
  }

  @UseGuards(AccessTokenGuard)
  @Post('verify-2fa')
  async verifyOtpAuth(
    @CurrentUser('id') userId: string,
    @Body() payload: VerifyTwoFaCodeDto,
  ) {
    const user = await this.userService
      .findById(userId)
      .select('twoFactorAuthSecret');

    return this.twoFaService.verifyTwoFaCode(
      payload.code,
      user.twoFactorAuthSecret,
    );
  }
}
