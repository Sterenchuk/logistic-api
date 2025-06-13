import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  Matches,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { LisanceOptions } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCarsDto {
  @IsString({ message: 'Model must be a string.' })
  @IsNotEmpty({ message: 'Model is required.' })
  model: string;

  @IsOptional()
  @IsInt({ message: 'Year must be an integer.' })
  @Min(1900, { message: 'Year must be at least 1900.' })
  @Type(() => Number) // Required for ParseIntPipe-like behavior with ValidationPipe
  year: number;

  //   @IsString({ message: 'Color must be a string.' })
  //   color: string;
  @IsString({ message: 'Model must be a string.' })
  @IsNotEmpty({ message: 'Model is required.' })
  brand: string;

  @IsString({ message: 'License plate must be a string.' })
  @IsNotEmpty({ message: 'License plate cannot be empty.' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'License plate must contain only uppercase letters, numbers, and hyphens.',
  })
  registrationPlate: string;

  @IsNotEmpty({ message: 'Type is required.' })
  @IsEnum(LisanceOptions)
  type: LisanceOptions;

  @IsOptional() // Make driverId optional
  @IsInt({ message: 'driverId must be an integer.' })
  driverId?: number; // Use the optional type `?` in TypeScript
}
