import { IsEmail, IsNotEmpty, IsNumber, Length } from "class-validator";

export class CheckChangePWCodeRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}