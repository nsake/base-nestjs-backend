import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SignUpDto } from './auth.dto';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { AwsService } from '../helpers/aws/aws.service';

@Injectable()
export class AuthService {
  constructor(
    private awsService: AwsService,
    private userService: UsersService,
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
      const user = await this.userService.findById(userId);

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
}
