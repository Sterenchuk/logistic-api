import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { JwtAuthGuard } from './auth/jwt-auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  app.enableCors();
}
bootstrap();
