import { PartialType } from '@nestjs/mapped-types';
import { CreateCarsDto } from './create-cars.dto';

export class UpdateCarsDto extends PartialType(CreateCarsDto) {}
