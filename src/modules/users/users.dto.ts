import { IsNotEmpty, IsNumberString } from 'class-validator';

export class TPaginationOptionDto {
  @IsNotEmpty()
  @IsNumberString()
  page: number;

  @IsNotEmpty()
  @IsNumberString()
  pageSize: number;
}
