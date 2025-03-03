import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetPayload } from 'src/common/decorator/get-jwt-payload.decorator';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { SignUpRequest } from './request/signup.request';
import { Public } from 'src/common/decorator/public.decorator';
import { SignInRequest } from './request/signin.request';
import { RefreshToken } from 'src/common/decorator/refresh-token.decorator';
import { SendChangePWCodeRequest } from './request/send-change-pw-code.request';
import { CheckChangePWCodeRequest } from './request/check-change-pw-code.request';
import { EditPWRequest } from './request/edit-pw.request';

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

  @RefreshToken()
  @Get('/re-issue')
  async reissue(@GetPayload() jwtPayload: JwtPayload) {
    return await this.authService.reissue(jwtPayload);
  }

  @Post('/withdraw')
  async withdrawUser(@GetPayload() jwtPayload: JwtPayload) {
    return await this.authService.withdraw(jwtPayload);
  }

  @Public()
  @Post('/send/code')
  async sendChangePWCode(
    @Body() sendChangePWCodeRequest: SendChangePWCodeRequest,
  ) {
    return await this.authService.sendChangePWCode(sendChangePWCodeRequest);
  }

  @Public()
  @Post('/edit/password')
  async editPW(@Body() editPWRequest: EditPWRequest) {
    return await this.authService.editPw(editPWRequest);
  }
}
