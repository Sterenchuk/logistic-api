import {UpdateCarsDto} from "./update-cars.dto";
import { PickType } from '@nestjs/swagger';

export class FindAllCarsDto extends PickType(UpdateCarsDto, [
'model',
'year',
'brand',
]) {
}
