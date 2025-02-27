import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class EditPWRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  code: string;
}