import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

export function appCreate(app: INestApplication): void {
  // Enable global validation pipes using class-validator
  // This validates incoming requests, strips unauthorized properties, and automatically transforms payloads to DTO classes
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

  // Override the default NestJS logger with Pino for highly performant, structured logging
  app.useLogger(app.get(Logger));

  // Initialize cookie-parser middleware to read and parse cookie headers from incoming requests
  app.use(cookieParser());

  // Configure OpenAPI (Swagger) builder for API documentation
  const config = new DocumentBuilder()
    .setTitle('Blog app Api')
    .setDescription('use the base API URL as http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms-of-service')
    .setLicense('MIT License', 'https://opensource.org/license/mit/')
    .addServer('http://localhost:3000')
    .setVersion('1.0')
    .build();

  // Generate the Swagger document based on the configuration
  const document = SwaggerModule.createDocument(app, config);

  // Mount the Swagger UI module on the '/api' route
  SwaggerModule.setup('api', app, document);

  // Enable Cross-Origin Resource Sharing (CORS) to allow requests from external frontend applications
  app.enableCors();
}
