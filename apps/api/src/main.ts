import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { resolveMongoUri } from './mongo';

async function bootstrap() {
  process.env.MONGODB_URI = resolveMongoUri();

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
