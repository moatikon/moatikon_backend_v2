import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Public } from '../decorator/public.decorator';
import { InvalidTokenFormatException } from 'src/exception/error/invalid-token-format.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer.toLowerCase() != 'bearer') {
      throw new InvalidTokenFormatException();
    }

    try {
      req.user = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (err) {
      throw new InvalidTokenFormatException();
    }

    return true;
  }
}
