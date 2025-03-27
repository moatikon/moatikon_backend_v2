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
import { MailService } from 'src/util/service/mail/mail.service';
import { RedisService } from 'src/util/service/redis.service';
import { SendChangePWCodeRequest } from './request/send-change-pw-code.request';
import { CheckChangePWCodeRequest } from './request/check-change-pw-code.request';
import { InvalidCodeException } from 'src/exception/error/invalid-code.exception';
import { EditPWRequest } from './request/edit-pw.request';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly datasource: DataSource,

    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokenResponse(user: User) {
    const generateJwt = async (isRefreshToken: boolean) => {
      const expiresIn = isRefreshToken ? '7d' : '1d';
      const secret = isRefreshToken
        ? this.configService.get('JWT_SECRET_RE')
        : this.configService.get('JWT_SECRET');

      return await this.jwtService.signAsync(
        { email: user.email },
        { expiresIn, secret },
      );
    };

    const accessToken = await generateJwt(false);
    const refreshToken = await generateJwt(true);

    this.redisService.set(`${user.email}_re`, refreshToken);

    return new TokenResponse(accessToken, refreshToken);
  }

  async signup(signupRequest: SignUpRequest) {
    const { email, nickname, password, deviceToken } = signupRequest;

    const userCheck = await this.userRepository.findOne({ where: { email } });
    if (userCheck) throw new UserAlreadyExistsException();

    const hashedPW: string = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      email,
      name: nickname,
      password: hashedPW,
      deviceToken,
    });

    return this.generateTokenResponse(user);
  }

  async signin(signinRequest: SignInRequest) {
    const { email, password, deviceToken } = signinRequest;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    if (!(await bcrypt.compare(password, user.password)))
      throw new InvalidPasswordException();

    if (user.available === false && user.withdrawDate != null) {
      user.available = true;
      user.withdrawDate = null;
      user.deviceToken = deviceToken;
      await this.userRepository.save(user);

      return this.generateTokenResponse(user);
    } else {
      await this.userRepository.update(user.email, { deviceToken });

      return this.generateTokenResponse(user);
    }
  }

  async reissue(jwtPayload: JwtPayload) {
    const { email } = jwtPayload;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    return this.generateTokenResponse(user);
  }

  async withdraw(jwtPayload: JwtPayload) {
    const qr = this.datasource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const date = new Date();
      const { email } = jwtPayload;
      const userData = await this.userRepository.findOne({ where: { email } });

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

  _generateCode(): string {
    const numCode = Math.floor(Math.random() * 1000000);
    const code = String(numCode).padStart(6, '0');
    return code;
  }

  async sendChangePWCode(sendChangePWCodeRequest: SendChangePWCodeRequest) {
    const { email } = sendChangePWCodeRequest;

    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) throw new UserNotFoundException();

      const code: string = this._generateCode();

      await this.mailService.sendCodeEmail(email, code);
      await this.redisService.set(email, code, 600);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async editPw(editPWRequest: EditPWRequest) {
    const qr = this.datasource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { email, password, code } = editPWRequest;
      const redisCode: string = await this.redisService.get(email);

      if (code == redisCode) {
        let user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new UserNotFoundException();

        const hashedPW: string = await bcrypt.hash(password, 10);
        user.password = hashedPW;

        await this.userRepository.save(user);
      } else {
        throw new InvalidCodeException();
      }

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
