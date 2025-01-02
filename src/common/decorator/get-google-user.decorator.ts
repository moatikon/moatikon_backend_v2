import { createParamDecorator } from '@nestjs/common';
import { GoogleUser } from '../interface/google-user.interface';

export const GetGoogleUser = createParamDecorator<GoogleUser>((_, context) => {
  const request = context.switchToHttp().getRequest();
  return request.user as GoogleUser;
});
