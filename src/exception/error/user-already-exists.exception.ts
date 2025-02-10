import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('해당 유저가 이미 존재합니다.', HttpStatus.NOT_FOUND);
  }
}
