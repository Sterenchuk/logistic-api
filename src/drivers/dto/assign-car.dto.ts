import { IsInt, IsPositive } from 'class-validator';

export class AssignCarDto {
  @IsInt({ message: 'Car ID must be an integer.' })
  @IsPositive({ message: 'Car ID must be a positive number.' })
  carId: number;
}
