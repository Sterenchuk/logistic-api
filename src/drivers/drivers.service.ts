import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
// import { CreateDriverDto } from './dto/create-drivers.dto';
import { Prisma, Driver } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// import { connect } from 'http2';
// import { UpdateDriverDto } from './dto/update-drivers.dto';

@Injectable()
export class DriversService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(exp?: number, minSalary?: number, maxSalary?: number) {
    const where: Prisma.DriverWhereInput = {};

    if (exp) {
      where.experience = { gte: exp };
    }
    console.log('Filtering by experience (gte):', exp);

    if (minSalary && maxSalary) {
      where.salary = { gte: minSalary, lte: maxSalary };
    } else if (minSalary) {
      where.salary = { gte: minSalary };
    } else if (maxSalary) {
      where.salary = { lte: maxSalary };
    }

    const drivers = await this.databaseService.driver.findMany({
      where,
      include: {
        car: true,
        driverLicense: true,
      },
    });

    if (!drivers || drivers.length === 0) {
      throw new NotFoundException('No drivers found.');
    }

    return drivers;
  }

  async findOne(id: number) {
    const driver = await this.databaseService.driver.findUnique({
      where: { id },
      include: {
        car: true,
        driverLicense: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found.`);
    }

    return driver;
  }

  async findOneByEmail(email: string) {
    const driver = await this.databaseService.driver.findUnique({
      where: { email },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ${email} not found`);
    }

    return driver;
  }

  async create(createDriverDto: Prisma.DriverCreateInput): Promise<Driver> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createDriverDto.password, salt);

    const databaseData: Prisma.DriverCreateInput = {
      ...createDriverDto,
      password: hashedPassword,
    };

    try {
      const newDriver = await this.databaseService.driver.create({
        data: databaseData,
        include: {
          driverLicense: true,
        },
      });

      return newDriver;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' // Unique constraint violation code
      ) {
        const target = error.meta?.target;
        if (Array.isArray(target) && target.includes('email')) {
          throw new ConflictException(
            `Email '${createDriverDto.email}' is already taken.`,
          );
        }

        console.warn(
          `Prisma unique constraint violation (P2002) on target: ${target}`,
        );

        throw new ConflictException('A unique constraint was violated.');
      }
      console.error('Error creating driver:', error);
      throw new InternalServerErrorException('Could not create driver.');
    }
  }

  async assignCar(carId: number, driverId: number) {
    try {
      //TODO make method find the carID, of the most sutiable car

      const driver = await this.databaseService.driver.findUnique({
        where: { id: driverId },
        include: {
          car: true,
          driverLicense: true, // Include the driver license if needed
        },
      });

      if (!driver) {
        throw new NotFoundException(`Driver with ID ${driverId} not found.`);
      }

      if (driver?.car) {
        throw new ConflictException(
          `Driver with ID ${driverId} already has a car assigned.`,
        );
      }

      const licenseTypes = driver.driverLicense?.type || [];

      const car = await this.databaseService.car.findUnique({
        where: { id: carId },
        include: { driver: true },
      });

      if (!car) {
        throw new NotFoundException(`Car with ID ${carId} not found.`);
      }

      if (!licenseTypes.includes(car.type)) {
        throw new BadRequestException(
          `Driver with ID ${driverId} does not have a valid license for car type ${car.type}. Required license: ${car.type}. Driver licenses: ${licenseTypes.join(', ')}`,
        );
      }

      const updateDriver = await this.databaseService.driver.update({
        where: { id: driverId },
        data: {
          car: {
            connect: { id: carId },
          },
        },
        include: { car: true },
      });

      return updateDriver;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (
        error.code === 'P2025' &&
        error instanceof Prisma.PrismaClientKnownRequestError
      ) {
        throw new ConflictException('Driver already has a car assigned.');
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Error assigning car ${carId} to driver ${driverId}:`,
        error,
      );
      throw new InternalServerErrorException('Could not assign car.');
    }
  }

  async unassignCar(driverId: number) {
    const driver = await this.databaseService.driver.findUnique({
      where: { id: driverId },
      include: { car: true },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found.`);
    }

    if (!driver.car) {
      throw new NotFoundException(
        `Driver car with driver ID ${driverId} not found.`,
      );
    }

    return this.databaseService.driver.update({
      where: { id: driverId },
      data: {
        car: {
          disconnect: true,
        },
      },
    });
  }
  async remove(id: number) {
    const driver = await this.databaseService.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found.`);
    }

    return this.databaseService.driver.delete({
      where: { id },
    });
  }

  async update(id: number, updateDriverDto: Prisma.DriverUpdateInput) {
    try {
      const oldDriver = await this.findOne(id);

      if (!oldDriver) {
        throw new NotFoundException(`Driver with ID ${id} not found.`);
      }
      if (updateDriverDto.password) {
        const salt = await bcrypt.genSalt();
        updateDriverDto.password = await bcrypt.hash(
          updateDriverDto.password,
          salt,
        );
      }

      const updatedDriver = await this.databaseService.driver.update({
        where: { id },
        data: {
          ...updateDriverDto,
        },
      });
      if (!updatedDriver) {
        throw new NotFoundException(`Driver with ID ${id} not found.`);
      }
      return updatedDriver;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw new InternalServerErrorException(
        `Could not update driver with ID ${id}.`,
      );
    }
  }
}
