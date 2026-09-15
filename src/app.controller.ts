import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Auth } from './modules/auth/decorator/auth.decorator.js';
import { AuthType } from './modules/auth/enums/auth-type.enum.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('debug/sentry')
  @Auth(AuthType.None)
  testSentry() {
    throw new InternalServerErrorException(
      'This is a test error to check Sentry integration! 🚀',
    );
  }
}
