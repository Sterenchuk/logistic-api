import { DriversModule } from './drivers/drivers.module';
import { CarsModule } from './cars/cars.module';
import { HttpLoggerModule } from './logger/logger.module';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpRequestLoggerMiddleware } from './logger/http-log-schema.middlaeware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    HttpLoggerModule,
    CarsModule,
    DriversModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const enableLogging = this.configService.get<string>('LOGGER_STATE');
    if (enableLogging === 'true') {
      consumer.apply(HttpRequestLoggerMiddleware).forRoutes('*');
    }
  }
}
