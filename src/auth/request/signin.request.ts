import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class SignInRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(4)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  deviceToken: string;
}
