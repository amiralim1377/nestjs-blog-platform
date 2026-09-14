import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      {
        err: exception,
        path: request.url,
        method: request.method,
      },
      'Critical System Error',
      stack,
    );

    Sentry.withScope((scope) => {
      const sanitizedBody = { ...request.body };
      if (sanitizedBody && sanitizedBody.password) {
        sanitizedBody.password = '*** [REDACTED] ***';
      }

      scope.setExtra('body', sanitizedBody);
      scope.setExtra('query', request.query);
      scope.setExtra('params', request.params);

      if (request.user) {
        scope.setUser({ id: request.user.sub, email: request.user.email });
      }

      Sentry.captureException(exception);
    });
    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Service is temporarily unavailable, please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
}
