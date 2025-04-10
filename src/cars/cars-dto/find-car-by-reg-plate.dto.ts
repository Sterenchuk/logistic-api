import { PickType } from '@nestjs/swagger';
import { CreateCarsDto } from './create-cars.dto';

export class FindCarByRegPlateDto extends PickType(CreateCarsDto, [
  'registrationPlate',
]) {}
