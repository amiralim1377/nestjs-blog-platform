import {
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
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
export class RedisModule implements OnApplicationShutdown, OnModuleInit {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async onModuleInit() {
    try {
      const response = await this.redisClient.ping();

      if (response === 'PONG') {
        console.log('✅ Successfully connected to Redis (Upstash).');
      }
    } catch (error: any) {
      console.error('❌ Failed to connect to Redis:', error.message);
    }
  }

  onApplicationShutdown(signal?: string) {
    console.log(`Closing Redis connection gracefully on ${signal}...`);
    this.redisClient.quit();
  }
}
