import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/users/users.model';

export const CurrentUser = createParamDecorator((data, ctx: ExecutionContext): User => {
  const req = ctx.switchToHttp().getRequest();
  const { user } = req;

  return data ? user?.[data] || undefined : user;
});
