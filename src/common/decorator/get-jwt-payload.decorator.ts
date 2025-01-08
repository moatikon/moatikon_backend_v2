import { createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '../interface/jwt-payload';

export const GetPayload = createParamDecorator((_, context) => {
  const request = context.switchToHttp().getRequest();

  return request.user as JwtPayload;
});
