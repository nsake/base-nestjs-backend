import { IsNotEmpty, IsNumberString } from 'class-validator';
import { OtpCodeDto } from 'src/modules/auth/auth.dto';

export class ChangePasswordUserDto extends OtpCodeDto {
  @IsNotEmpty()
  @IsNumberString()
  oldPassword: number;
}
