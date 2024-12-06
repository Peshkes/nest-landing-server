import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from "class-validator";
import { PasswordComplexityValidator } from "../validators/password-complexity.validator";

export class RegistrationDto {
  @IsString({ message: "Name must be a string", always: true })
  name: string;

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
  @Validate(PasswordComplexityValidator)
  password: string;
}
