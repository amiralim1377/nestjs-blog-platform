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
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DataResponseInterceptor } from './common/interceptors/data-response/data-response.interceptor.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { PostsModule } from './modules/posts/posts.module.js';
import { PaginationModule } from './common/pagination/pagination.module.js';
import { SentryModule } from '@sentry/nestjs/setup';
import { randomUUID } from 'crypto';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter.js';
import { MailModule } from './modules/mail/mail.module.js';
import { UploadsModule } from './modules/uploads/uploads.module.js';
import mailConfig from './modules/mail/config/mail.config.js';
import { SupabaseModule } from './modules/supabase/supabase.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { TagsModule } from './modules/tags/tags.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CommentsModule } from './modules/comments/comments.module.js';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, mailConfig],
      validationSchema: enviromentValidation,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
        autoLogging: true,
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: parseInt(
              configService.get<string>('THROTTLE_TTL', '60000'),
              10,
            ),
            limit: parseInt(
              configService.get<string>('THROTTLE_LIMIT', '100'),
              10,
            ),
          },
        ],
        storage: new ThrottlerStorageRedisService(
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        ),
      }),
    }),
    SentryModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
          tls: configService.get<string>('REDIS_URL')?.startsWith('rediss')
            ? { rejectUnauthorized: false }
            : undefined,
        },
      }),
    }),
    UsersModule,
    AuthModule,
    RedisModule,
    PostsModule,
    PaginationModule,
    MailModule,
    UploadsModule,
    SupabaseModule,
    TagsModule,
    CategoriesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
})
export class AppModule {}
