import { IsEmail, IsNotEmpty } from "class-validator";

export class SendChangePWCodeRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}