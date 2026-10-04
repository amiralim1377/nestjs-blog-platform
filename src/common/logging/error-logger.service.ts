import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ErrorLoggerService {
  constructor(private readonly logger: Logger) {}

  logSystemError(exception: unknown, request: Request): void {
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      {
        err: exception,
        stack,
        method: request.method,
        path: request.url,
        ip: request.ip,
      },
      'Critical System Error',
    );
  }
}
