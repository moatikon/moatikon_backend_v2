import { HttpStatus } from "@nestjs/common";
import { HttpException } from "../http.exception";

export class InvalidDDayException extends HttpException {
  constructor() {
    super("이미 지나간 날짜는 선택할 수 없습니다.", HttpStatus.BAD_REQUEST)
  }
}