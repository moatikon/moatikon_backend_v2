import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenResponse } from './response/token.response';
import { GoogleUser } from 'src/common/interface/google-user.interface';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { UserNotFoundException } from 'src/exception/error/user-not-found.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly datasource: DataSource,
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
      await this.userRepository.save({
        email: googleUser.email,
        name: googleUser.name,
      });
    } else if (!userData.available) {
      userData.available = true;
      userData.withdrawDate = null;
      await this.userRepository.save(userData);
    }

    return new TokenResponse(
      await this.generateJwt(googleUser, false),
      await this.generateJwt(googleUser, true),
    );
  }

  async withdraw(jwtPayload: JwtPayload) {
    const qr = this.datasource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { email } = jwtPayload;
      const userData = await this.userRepository.findOne({
        where: { email },
      });

      if (!userData) {
        throw new UserNotFoundException();
      }

      userData.available = false;
      userData.withdrawDate = new Date();

      await this.userRepository.save(userData);
      await qr.commitTransaction();

      return true;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
