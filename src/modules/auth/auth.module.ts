import { Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { AuthController } from './auth.controller.js';
import { HashingProvider } from './providers/hashing.provider.js';
import { ArgonProvider } from './providers/argon.provider.js';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: ArgonProvider,
    },
  ],
  exports: [HashingProvider],
})
export class AuthModule {}
