import { IsEmail, IsString, Length } from "class-validator";

export class SignUpRequest {
  @IsString()
  @Length(1, 12)
  nickname: string;

  @IsEmail()
  email: string;

  @Length(4)
  password: string;
}
