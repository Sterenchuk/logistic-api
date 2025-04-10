import {
  IsString,
  IsEmail,
  IsInt,
  IsPositive,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  MinLength,
  ValidateNested,
  IsNotEmptyObject,
  IsDefined,
  IsNumber,
  Min,
  IsStrongPassword,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LisanceOptions } from '@prisma/client';

class DriverLicenseCreateDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'License type array cannot be empty.' })
  @IsEnum(LisanceOptions, {
    each: true,
    message: 'Each license type must be a valid LisanceOptions enum value.',
  })
  type: LisanceOptions[];
}

export class CreateDriverDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  name: string;

  @IsEmail({}, { message: 'A valid email address is required.' })
  email: string;

  @IsString()
  @IsStrongPassword(
    { minLength: 8 },
    {
      message:
        'Password must be at least 8 characters long and meet complexity requirements (e.g., uppercase, lowercase, number, symbol).',
    },
  )
  password: string;
  @IsInt({ message: 'Experience must be an integer.' })
  @Min(0, { message: 'Experience cannot be negative.' })
  experience: number;

  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Salary must be a valid number.' },
  )
  @IsPositive({ message: 'Salary must be a positive number.' })
  @Min(0, { message: 'Salary cannot be negative.' }) // Use if salary >= 0 (more flexible)
  salary: number;

  @IsDefined()
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'License information is required and cannot be empty.' },
  )
  @ValidateNested()
  @Type(() => DriverLicenseCreateDto)
  driverLicense: DriverLicenseCreateDto;
}
