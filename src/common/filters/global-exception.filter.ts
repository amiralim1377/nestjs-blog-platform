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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // ۲. پردازش خطاهای بحرانی (۵۰۰ به بالا)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.captureSentryException(exception, request);
      this.logSystemError(exception, request);
    }

    if (exception instanceof HttpException) {
      return response.status(status).json(exception.getResponse());
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Service is temporarily unavailable, please try again later.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private captureSentryException(
    exception: unknown,
    request: Request & { user?: any },
  ): void {
    Sentry.withScope((scope) => {
      const sanitizedBody = request.body ? { ...request.body } : {};

      const sensitiveFields = [
        'password',
        'passwordConfirm',
        'token',
        'refreshToken',
      ];
      for (const field of sensitiveFields) {
        if (sanitizedBody[field]) {
          sanitizedBody[field] = '*** [REDACTED] ***';
        }
      }

      scope.setExtra('body', sanitizedBody);
      scope.setExtra('query', request.query);
      scope.setExtra('params', request.params);
      scope.setExtra('ip', request.ip);

      if (request.user) {
        scope.setUser({ id: request.user.sub, email: request.user.email });
      }

      Sentry.captureException(exception);
    });
  }

  private logSystemError(exception: unknown, request: Request): void {
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      {
        err: exception,
        path: request.url,
        method: request.method,
        ip: request.ip,
      },
      'Critical System Error',
      stack,
    );
  }
}
