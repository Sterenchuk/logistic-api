// src/drivers/dto/find-drivers-query.dto.ts
import { IsOptional, IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type decorator

export class IdDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID must be an integer.' })
  @Min(1, { message: 'ID must be a positive integer.' })
  @Max(2147483647, { message: 'ID must be less than 1000000.' })
  id: number;
}
