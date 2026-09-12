import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  //   pino-loger-config
  app.useLogger(app.get(Logger));

  //   swagger-config
  const config = new DocumentBuilder()
    .setTitle('Blog app Api')
    .setDescription('use the base API URL as http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms-of-service')
    .setLicense('MIT License', 'https://opensource.org/license/mit/')
    .addServer('http://localhost:3000')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.enableCors();
}
