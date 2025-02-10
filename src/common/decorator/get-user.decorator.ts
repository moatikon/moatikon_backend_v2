import { createParamDecorator } from '@nestjs/common';
import { UserInterface } from '../interface/user.interface';

export const GetUser = createParamDecorator<UserInterface>((_, context) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
