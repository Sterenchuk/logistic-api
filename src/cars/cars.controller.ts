import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UsePipes,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarsDto } from './cars-dto/create-cars.dto';
import { UpdateCarsDto } from './cars-dto/update-cars.dto';
import { FindAllCarsDto } from './cars-dto/find-all-cars.dto';
import { FindCarByRegPlateDto } from './cars-dto/find-car-by-reg-plate.dto';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { Prisma } from '@prisma/client';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllCars(@Query() conditions: FindAllCarsDto) {
    return this.carsService.findAll(conditions);
  }

  @Get('driver/:id')
  findAllCarsByDriverId(@Param('id', new ParseIntPipe()) id: number) {
    return this.carsService.findAll({ driverId: id }); // may be some day it will be many
  }

  @Get('reg-plate/:registrationPlate')
  @UsePipes(new ValidationPipe({ transform: true }))
  findOneCarRegPlate(@Param() { registrationPlate }: FindCarByRegPlateDto) {
    // By DTO it must be not undefined (if @IsNotEmpty() is used in the DTO)
    return this.carsService.findOneRegPlate(registrationPlate);
  }

  @Get(':id')
  findOneCarId(@Param('id', new ParseIntPipe()) id: number) {
    return this.carsService.findOneCarId(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  createCar(@Body() createCarDto: CreateCarsDto) {
    return this.carsService.create(createCarDto);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateCar(
    @Param('id', new ParseIntPipe()) id: number,

    @Body() updateCarDto: UpdateCarsDto,
  ) {
    {
      return this.carsService.update(id, updateCarDto);
    }
  }

  @Delete(':id')
  deketeCar(@Param('id', new ParseIntPipe()) id: number) {
    return this.carsService.delete(id);
  }
}
