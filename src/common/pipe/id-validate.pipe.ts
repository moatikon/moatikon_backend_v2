import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isNotEmpty, isUUID } from 'class-validator';

@Injectable()
export class IdValidatePipe implements PipeTransform {
  transform(value: any) {
    if (!isNotEmpty(value)) {
      throw new BadRequestException('ID는 빈칸으로 요청할 수 없습니다.');
    }
    if (!isUUID(value, '4')) {
      throw new BadRequestException('올바른 형식의 아이디가 아닙니다.');
    }
    return value;
  }
}