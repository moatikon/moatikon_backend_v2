import { HttpStatus } from "@nestjs/common";
import { HttpException } from "../http.exception";

export class InvalidCodeException extends HttpException {
  constructor() {
    super("메일로 전송된 코드와 일치하지 않습니다.", HttpStatus.BAD_REQUEST)
  }
}