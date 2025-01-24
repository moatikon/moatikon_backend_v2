import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class TikonNotFoundException extends HttpException {
  constructor() {
    super('해당 ID의 기프티콘을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
