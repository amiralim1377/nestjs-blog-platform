import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
          throw new Error('REDIS_URL is not defined in .env file!');
        }
        return new Redis(redisUrl);
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string) {
    console.log(`Closing Redis connection gracefully on ${signal}...`);
  }
}
