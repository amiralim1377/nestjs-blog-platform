import { INestApplication, ValidationPipe } from '@nestjs/common';

export function appCreate(app: INestApplication): void {
  // use validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();
}
