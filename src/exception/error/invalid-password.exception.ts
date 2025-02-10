import { HttpStatus } from "@nestjs/common";
import { HttpException } from "../http.exception";

export class InvalidPasswordException extends HttpException {
  constructor() {
    super("유효하지 않은 비밀번호입니다.", HttpStatus.BAD_REQUEST)
  }
}