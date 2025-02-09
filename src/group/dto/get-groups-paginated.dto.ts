import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Transform, Type } from "class-transformer";
import { Roles } from "../group.types";

export class GetGroupsPaginatedDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((role) => role.trim().toLowerCase())
        .filter((role) => Object.keys(Roles).includes(role));
    }
    return value || [];
  })
  roles?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Transform(({ value }) => value || 0)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => value || 10)
  limit: number = 10;
}
