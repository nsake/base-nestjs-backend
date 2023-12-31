import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsString,
  IsPhoneNumber,
  Length,
} from 'class-validator';

export class OtpCodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Should be 6 symbols' })
  otpCode: string;
}
export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Min password length 6 symbols' })
  @MaxLength(30, { message: 'Max password length 30 symbols' })
  password: string;

  @IsNotEmpty()
  @IsString()
  telegram: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phone: string;
}

export class SignInDto extends OtpCodeDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Min password length 6 symbols' })
  @MaxLength(30, { message: 'Max password length 30 symbols' })
  password: string;
}

export class VerifyTwoFaCodeDto extends OtpCodeDto {}
