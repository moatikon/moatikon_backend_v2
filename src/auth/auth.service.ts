import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { UserNotFoundException } from 'src/exception/error/user-not-found.exception';
import { SignUpRequest } from './request/signup.request';
import { UserAlreadyExistsException } from 'src/exception/error/user-already-exists.exception';
import * as bcrypt from 'bcrypt';
import { TokenResponse } from './response/token.response';
import { SignInRequest } from './request/signin.request';
import { InvalidPasswordException } from 'src/exception/error/invalid-password.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly datasource: DataSource,
  ) {}

  async generateJwt(user: User, isRefreshToken: boolean) {
    const expiresIn = isRefreshToken ? '7d' : '1d';

    return await this.jwtService.signAsync(
      {
        email: user.email,
        isRefreshToken: isRefreshToken,
      },
      {
        expiresIn,
        secret: this.configService.get('JWT_SECRET'),
      },
    );
  }

  async signup(signupRequest: SignUpRequest) {
    const { email, nickname, password } = signupRequest;

    const userCheck = await this.userRepository.findOne({ where: { email } });
    if (userCheck) throw new UserAlreadyExistsException();

    const hashedPW: string = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      email,
      name: nickname,
      password: hashedPW,
    });

    return new TokenResponse(
      await this.generateJwt(user, false),
      await this.generateJwt(user, true),
    );
  }

  async signin(signinRequest: SignInRequest) {
    const { email, password } = signinRequest;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    if (!(await bcrypt.compare(password, user.password)))
      throw new InvalidPasswordException();

    if(user.available === false && user.withdrawDate != null) {
      user.available = true;
      user.withdrawDate = null;
      await this.userRepository.save(user);

      return new TokenResponse(
        await this.generateJwt(user, false),
        await this.generateJwt(user, true),
      );
    } else {
      return new TokenResponse(
        await this.generateJwt(user, false),
        await this.generateJwt(user, true),
      );
    }
  }

  async reissue(jwtPayload: JwtPayload) {
    const { email } = jwtPayload;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    return new TokenResponse(
      await this.generateJwt(user, false),
      await this.generateJwt(user, true),
    );
  }

  async withdraw(jwtPayload: JwtPayload) {
    const qr = this.datasource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const date = new Date();
      const { email } = jwtPayload;
      const userData = await this.userRepository.findOne({
        where: { email },
      });

      if (!userData) {
        throw new UserNotFoundException();
      }

      userData.available = false;
      userData.withdrawDate = new Date(date.setDate(date.getDate() + 30));

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
