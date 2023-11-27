import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsString,
  IsPhoneNumber,
} from 'class-validator';

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

export class VerifyTwoFaCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
