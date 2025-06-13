import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [DriversService],
  controllers: [DriversController],
  exports: [DriversService],
})
export class DriversModule {}
