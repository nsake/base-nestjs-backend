import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';

export const File = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<File> => {
    try {
      const request = ctx.switchToHttp().getRequest();

      const file = await request?.file();

      return file;
    } catch (err) {
      throw new BadRequestException('Can not proceed file parsing');
    }
  },
);
