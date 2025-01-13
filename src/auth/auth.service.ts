import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenResponse } from './response/token.response';
import { GoogleUser } from 'src/common/interface/google-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwt(googleUser: GoogleUser, isRefreshToken: boolean) {
    return await this.jwtService.signAsync(
      {
        email: googleUser.email,
        isRefreshToken: isRefreshToken,
      },
      {
        expiresIn: '24h',
        secret: this.configService.get('JWT_SECRET'),
      },
    );
  }

  async googleCallback(googleUser: GoogleUser) {
    const userData = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (!userData) {
      const user = this.userRepository.create({
        email: googleUser.email,
        name: googleUser.name,
      });
      await this.userRepository.save(user);
    } 

    return new TokenResponse(
      await this.generateJwt(googleUser, false),
      await this.generateJwt(googleUser, true),
    );
  }
}
