import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type, Transform } from "class-transformer";
import { Roles } from "../group.types";

export class GetGroupsPaginatedDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((role) => {
          return Roles[role.toLowerCase() as keyof typeof Roles];
        })
        .filter((role) => role !== undefined);
    }
    return value || [];
  })
  roles?: number[];

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
