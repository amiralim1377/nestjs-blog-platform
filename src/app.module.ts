import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config.js';
import enviromentValidation from './config/enviroment.validation.js';
import databaseConfig from './config/database.config.js';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './modules/users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: enviromentValidation,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                targets: [
                  {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      colorize: true,
                    },
                  },
                  {
                    target: 'pino/file',
                    options: {
                      destination: './logs/app-dev.log',
                      mkdir: true,
                    },
                  },
                ],
              }
            : undefined,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          synchronize: configService.get('database.synchronize'),
          port: configService.get('database.port'),
          username: configService.get('database.user'),
          password: configService.get('database.password'),
          host: configService.get('database.host'),
          autoLoadEntities: configService.get('database.autoLoadEntities'),
          database: configService.get('database.name'),
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
