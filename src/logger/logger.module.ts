import { HttpRequestLogSchema, HttpRequestLoggerMiddleware } from './http-log-schema.middlaeware';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'HttpRequestLog', schema: HttpRequestLogSchema }])],
  exports: [MongooseModule],
})
export class HttpLoggerModule {}
