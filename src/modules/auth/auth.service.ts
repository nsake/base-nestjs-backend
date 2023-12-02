import dayjs from 'dayjs';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './auth.dto';

import { TokensService } from './tokens.service';
import { UsersService } from '../users/users.service';
import { AwsService } from '../helpers/aws/aws.service';
import { EmailService } from '../helpers/email/email.service';
import { Password } from 'src/infrastructure/utils/password.util';
import { TwoFaService } from './2fa.service';

@Injectable()
export class AuthService {
  constructor(
    private awsService: AwsService,
    private userService: UsersService,
    private twoFaService: TwoFaService,
    private emailService: EmailService,
    private tokenService: TokensService,
  ) {}

  /**
   * Init user entity, just base info
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} telegram
   * @param {string} phone
   *
   *
   * @return {object(string, string)} tokens: {accessToken: string, refreshToken: string}
   */
  async initUserAndAuth(credentials: SignUpDto) {
    const duplicated = await this.userService.findWithQuery({
      $or: [{ phone: credentials.phone }, { email: credentials.email }],
    });

    if (duplicated)
      throw new BadRequestException(
        'Such phone number or email is already exists',
      );

    const user = await this.userService.create(credentials);

    return this.tokenService.generateTokensAndUpdate(user);
  }

  /**
   * Saves KYC selfie, if it were not done yet
   *
   * @param {string} userId
   * @param {File} file
   *
   * @return {Promise<HttpStatus | Error>} returns Error or code 200
   */
  async uploadKYCSelfie(userId: string, file: File) {
    return new Promise(async (resolve, reject) => {
      const user = await this.userService.findById(userId).select('kycSelfie');

      if (user.kycSelfie) reject('KYC selfie were already uploaded');

      resolve(user);
    })
      .then(() => {
        return this.awsService.uploadFileWithS3(file);
      })
      .then(async (kycSelfie: string) => {
        try {
          const isSaved = await this.userService.findOneByIdAndUpdate(userId, {
            kycSelfie,
          });

          if (!isSaved) {
            await this.awsService.deleteFileWithS3(kycSelfie);

            throw new UnprocessableEntityException(
              'Can not save uploaded image to database now',
            );
          }

          return HttpStatus.OK;
        } catch (e) {
          throw new UnprocessableEntityException(
            e?.message || 'Can not save uploaded image to database now',
          );
        }
      })
      .catch((reason: string) => {
        throw new InternalServerErrorException(
          reason || 'Failed uploading file to aws',
        );
      });
  }

  /**
   * Requests confirm email
   *
   * @param {string} userId
   *
   * @return {Promise<Error | void>} void
   */
  public async requestConfirmEmail(userId: string) {
    const user = await this.userService.findById(userId).select({
      isEmailConfirmed: true,
      emailToken: true,
      email: true,
    });

    if (user.isEmailConfirmed)
      throw new ForbiddenException('Email is already confirmed');

    if (!user.emailToken)
      return await this.sendConfirmationEmail(userId, user.email);

    try {
      const decodedToken = await this.tokenService.verifyCustomToken(
        user.emailToken,
      );

      if (dayjs().isAfter(dayjs(decodedToken.iat).add(1, 'm')))
        return await this.sendConfirmationEmail(userId, user.email);

      return new ForbiddenException('Resend timeout 1 minute');
    } catch (err) {
      if (err?.message.includes('expired'))
        return await this.sendConfirmationEmail(userId, user.email);
    }
  }

  public async confirmEmail(token: string) {
    try {
      const decodedToken = await this.tokenService.verifyCustomToken(token);

      const user = await this.userService.findByEmail(decodedToken.email);

      if (!user) return new ForbiddenException('Invalid token');

      await this.userService.findOneByIdAndUpdate(user.id, {
        isEmailConfirmed: true,
      });
    } catch (err) {
      if (err?.message?.includes('invalid token'))
        return new ForbiddenException('Invalid token');

      if (err?.message?.includes('expired'))
        return new ForbiddenException('Token has been expired');
    }
  }

  private async sendConfirmationEmail(userId: string, email: string) {
    const emailToken = await this.tokenService.generateCustomToken(
      { email },
      '30m',
    );

    await this.userService.findOneByIdAndUpdate(userId, { emailToken });

    await this.emailService.sendConfirmationCodeMail(email, emailToken);
  }

  /**
   * Sign-in process with login and password
   *
   * @param {string} login email or phone
   * @param {string} password password
   *
   *
   * @return {object(string, string)} tokens: {accessToken: string, refreshToken: string}
   */
  async signIn(credentials: SignInDto) {
    try {
      const user = await this.userService
        .findWithQuery({
          $or: [{ phone: credentials.login }, { email: credentials.login }],
        })
        .select({
          password: true,
          email: true,
          twoFactorAuthSecret: true,
        });

      if (!user) throw new BadRequestException('Incorrect credentials');

      const isTwoFactorValid = this.twoFaService.verifyTwoFaCode(
        credentials.otpCode,
        user.twoFactorAuthSecret,
      );

      if (!isTwoFactorValid)
        throw new BadRequestException('Invalid two factor code');

      const isPasswordsEqual = await Password.compare(
        user.password,
        credentials.password,
      );

      if (!isPasswordsEqual)
        throw new BadRequestException('Incorrect credentials');

      return this.tokenService.generateTokensAndUpdate(user);
    } catch (err) {
      console.log('err', err);

      throw new InternalServerErrorException(
        'Authentication service is not available now, try later',
      );
    }
  }
}
