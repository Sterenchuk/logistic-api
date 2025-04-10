import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
  ParseFloatPipe,
  BadRequestException,
  Body,
  Param,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-drivers.dto';
import { UpdateDriverDto } from './dto/update-drivers.dto';
import { Prisma } from '@prisma/client';
import { AssignCarDto } from './dto/assign-car.dto';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ParseBigIntPipe } from '../pipes/bigint.pipe';

@Controller('drivers')
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Get()
  findAll(
    @Query('exp', new ParseIntPipe({ optional: true })) // set a value to show exp from it
    exp: number,

    @Query('max-salary', new ParseFloatPipe({ optional: true }))
    maxSalary: number,

    @Query('min-salary', new ParseFloatPipe({ optional: true }))
    minSalary: number,
  ) {
    return this.driversService.findAll(exp, minSalary, maxSalary);
  }

  @Get(':id')
  findOne(@Param('id', ParseBigIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

  @Post()
  async create(@Body(ValidationPipe) createDriverDto: CreateDriverDto) {
    const { driverLicense, ...rest } = createDriverDto;

    const prismaCompatibleDto: Prisma.DriverCreateInput = {
      ...rest,
      driverLicense: {
        create: {
          type: driverLicense.type,
        },
      },
    };

    return this.driversService.create(prismaCompatibleDto);
  }

  @Patch(':id')
  async update(
    @Body(ValidationPipe) updateDriverDto: UpdateDriverDto,
    @Param('id', ParseBigIntPipe) id: number,
  ) {
    const { driverLicense, ...rest } = updateDriverDto;
    let prismaCompatibleDto: Prisma.DriverUpdateInput = {};
    console.log(id, updateDriverDto);

    if (!driverLicense) {
      prismaCompatibleDto = {
        ...rest,
      };
    } else {
      prismaCompatibleDto = {
        ...rest,
        driverLicense: {
          update: {
            type: driverLicense.type,
          },
        },
      };
    }
    return this.driversService.update(id, prismaCompatibleDto);
  }

  @Patch('assign-car/:id')
  async assignCar(
    @Body(ValidationPipe) assignCarDto: AssignCarDto,
    @Param('id', ParseBigIntPipe) id: number,
  ) {
    if (!assignCarDto.carId) {
      throw new BadRequestException('Car ID is required.');
    }

    return this.driversService.assignCar(assignCarDto.carId, id);
  }

  @Patch('unassign-car/:id')
  async unassignCar(@Param('id', ParseBigIntPipe) id: number) {
    const driver = await this.driversService.findOne(id);

    if (!driver) {
      throw new BadRequestException(`Driver with ID ${id} not found.`);
    }

    if (!driver.car) {
      throw new BadRequestException(
        `Driver with ID ${id} does not have an assigned car.`,
      );
    }

    return this.driversService.unassignCar(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseBigIntPipe) id: number) {
    return this.driversService.remove(id);
  }
}
