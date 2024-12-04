import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignInDto {
  @IsEmail(
    {},
    {
      message: "Invalid email format",
    },
  )
  email: string;

  @IsString({
    message: "Password must be a string",
  })
  @IsNotEmpty({
    message: "Password is required",
  })
  @MinLength(8, {
    message: "Password must be at least 8 characters long",
  })
  password: string;
}
