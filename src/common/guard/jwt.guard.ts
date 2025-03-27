import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Public } from '../decorator/public.decorator';
import { InvalidTokenFormatException } from 'src/exception/error/invalid-token-format.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interface/jwt-payload';
import { RefreshToken } from '../decorator/refresh-token.decorator';
import { RedisService } from 'src/util/service/redis.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    const isPublic = this.reflector.get(Public, context.getHandler());
    const isRefreshToken = this.reflector.get(
      RefreshToken,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    try {
      const [bearer, token] = authorization.split(' ');

      if (bearer.toLowerCase() != 'bearer') {
        throw Error();
      }

      if(isRefreshToken) {
        const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET_RE'),
        });
        if(await this.redisService.get(`${payload.email}_re`) != token) {
          throw Error();
        }
        req.user = payload;
      } else {
        const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
        req.user = payload;
      }
    } catch (_) {
      throw new InvalidTokenFormatException();
    }

    return true;
  }
}
