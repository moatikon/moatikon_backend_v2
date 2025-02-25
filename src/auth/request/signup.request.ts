import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class SignUpRequest {
  @IsString()
  @Length(1, 12)
  @IsNotEmpty()
  nickname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(4)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  deviceToken: string;
}
