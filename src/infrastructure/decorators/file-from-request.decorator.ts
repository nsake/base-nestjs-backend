import {
  ExecutionContext,
  BadRequestException,
  createParamDecorator,
} from '@nestjs/common';

export const File = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<File> => {
    const request = ctx.switchToHttp().getRequest();

    // extract the files from the request object
    const multiPart = await request.file();

    if (!multiPart.file)
      throw new BadRequestException(
        'Invalid file or it is not exists in request',
      );

    return multiPart;
  },
);
