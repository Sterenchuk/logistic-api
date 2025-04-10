import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common/exceptions';
import { CreateCarsDto } from './cars-dto/create-cars.dto';

@Injectable()
export class CarsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(conditions?) {
    const cars = await this.databaseService.car.findMany({
      where: conditions,
      include: {
        driver: true,
      },
    });

    if (!cars || cars.length === 0) {
      throw new NotFoundException('No cars found.');
    }
    return cars;
  }

  async findOneCarId(id: number) {
    const car = await this.databaseService.car.findUnique({
      where: { id },
      include: {
        driver: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found.`);
    }

    return car;
  }

  async findOneRegPlate(registrationPlate: string) {
    const car = await this.databaseService.car.findUnique({
      where: { registrationPlate },
      include: {
        driver: true,
      },
    });

    if (!car) {
      throw new NotFoundException(
        `Car with registration plate ${registrationPlate} not found.`,
      );
    }

    return car;
  }
  async create(createCarDto: CreateCarsDto): Promise<Prisma.CarCreateInput> {
    const { driverId, ...carData } = createCarDto;

    const data: Prisma.CarCreateInput = {
      ...carData,
      ...(driverId && {
        driver: {
          connect: { id: driverId },
        },
      }),
    };

    const car = await this.databaseService.car.create({
      data,
    });

    if (!car) {
      throw new NotFoundException('Car not created.');
    }

    return car;
  }

  async update(id: number, updateCarDto: Prisma.CarUpdateInput) {
    const car = await this.databaseService.car.update({
      where: { id },
      data: updateCarDto,
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found.`);
    }

    return car;
  }

  async delete(id: number) {
    const car = await this.databaseService.car.delete({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found.`);
    }

    return car;
  }
}
