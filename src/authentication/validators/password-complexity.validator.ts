import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: "PasswordComplexity", async: false })
export class PasswordComplexityValidator implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  defaultMessage(): string {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }
}
