import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetPayload } from 'src/common/decorator/get-jwt-payload.decorator';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { SignUpRequest } from './request/signup.request';
import { Public } from 'src/common/decorator/public.decorator';
import { SignInRequest } from './request/signin.request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signup(@Body() signupReqeust: SignUpRequest) {
    return await this.authService.signup(signupReqeust);
  }

  @Public()
  @Post('/signin')
  async signin(@Body() singinRequest: SignInRequest) {
    return await this.authService.signin(singinRequest);
  }

  @Post('/withdraw')
  async withdrawUser(@GetPayload() jwtPayload: JwtPayload) {
    return await this.authService.withdraw(jwtPayload);
  }
}
