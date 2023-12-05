import { Transform, Type } from 'class-transformer';
import { IsDefined, IsIn, IsNotEmpty, IsNumber, IsObject, ValidateNested } from 'class-validator';

export class SortOption {
  @IsIn([1, -1])
  @IsNumber()
  @Transform(({ value }) => Number(value))
  createdAt: number;
}
export class TPaginationOptionDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Math.abs(value))
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Math.abs(value))
  pageSize: number;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => SortOption)
  sort: SortOption;
}
