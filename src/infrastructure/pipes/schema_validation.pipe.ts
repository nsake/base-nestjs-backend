import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SchemaValidationPipe<T> implements PipeTransform<any> {
  constructor(private metatype: Type<any>) {}

  async transform(value: T): Promise<T> {
    const object = plainToClass(this.metatype, value);
    Object.entries(object).forEach(([key, value]) => {
      if (value === 'true' || value === 'false')
        object[key] = value === 'true' ? true : false;
    });
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        errors,
      });
    }
    return value;
  }
}
