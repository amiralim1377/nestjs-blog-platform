import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from '../sentry/sentry.service.js';
import { ErrorLoggerService } from '../logging/error-logger.service.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly sentryService: SentryService,
    private readonly errorLoggerService: ErrorLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.sentryService.captureException(exception, request);
      this.errorLoggerService.logSystemError(exception, request);
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
}
