import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetGoogleUser } from 'src/common/decorator/get-google-user.decorator';
import { GoogleUser } from 'src/common/interface/google-user.interface';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorator/public.decorator';
import { GetPayload } from 'src/common/decorator/get-jwt-payload.decorator';
import { JwtPayload } from 'src/common/interface/jwt-payload';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@GetGoogleUser() googleUser: GoogleUser) {
    return await this.authService.googleCallback(googleUser);
  }

  @Post('/withdraw')
  async withdrawUser(@GetPayload() jwtPayload: JwtPayload) {
    return await this.authService.withdraw(jwtPayload);
  }
}
