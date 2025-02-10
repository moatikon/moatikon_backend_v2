import { IsEmail, IsString, Length } from "class-validator";

export class SignInRequest {
  @IsEmail()
  email: string;

  @Length(4)
  password: string;
}
