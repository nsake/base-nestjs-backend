import { PipeTransform, Injectable, BadRequestException, Type } from '@nestjs/common';
import { isJSON, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SchemaValidationPipe<T> implements PipeTransform<any> {
  constructor(private metatype: Type<any>, private propToTransform?: string[]) {}

  async transform(value: T): Promise<T> {
    if (this.propToTransform) {
      this.propToTransform.map((propertyName: string) => {
        const entityToParse = value[propertyName];

        if (!entityToParse) throw new BadRequestException('Can not find such query parameter');

        if (!isJSON(entityToParse))
          throw new BadRequestException(`${entityToParse} contains invalid JSON `);

        value[propertyName] = JSON.parse(entityToParse);
      });
    }

    const object = plainToClass(this.metatype, value);

    Object.entries(object).forEach(([key, value]) => {
      if (value === 'true' || value === 'false') object[key] = value === 'true' ? true : false;
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

    return object;
  }
}
