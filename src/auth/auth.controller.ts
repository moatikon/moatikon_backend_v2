import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetGoogleUser } from 'src/common/decorator/get-google-user.decorator';
import { GoogleUser } from 'src/common/interface/google-user.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('google'))
  @Get('google')
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@GetGoogleUser() googleUser: GoogleUser) {

    console.log(googleUser);
    

    return await this.authService.googleCallback(googleUser);
  }
}
