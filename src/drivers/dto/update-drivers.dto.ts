import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverDto } from './create-drivers.dto';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {}
