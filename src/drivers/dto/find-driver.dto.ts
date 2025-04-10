// src/drivers/dto/find-drivers-query.dto.ts
import { IsOptional, IsInt, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type decorator

export class FindDriversQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Experience must be an integer.' })
  @Min(0, { message: 'Experience must be non-negative.' })
  experience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Salary must be a number.' })
  @Min(0, { message: 'Salary must be non-negative.' })
  salary?: number;

  //   @IsOptional()
  //   @Type(() => Number)
  //   @IsInt()
  //   @Min(1)
  //   limit?: number;

  @IsOptional()
  @IsString()
  name?: string;
}
