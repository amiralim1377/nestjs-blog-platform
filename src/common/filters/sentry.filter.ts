import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SentryFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logger.error(`[Unhandled Exception] at ${request.url}`, exception);

      Sentry.withScope((scope) => {
        const sanitizedBody = { ...request.body };
        if (sanitizedBody && sanitizedBody.password) {
          sanitizedBody.password = '*** [REDACTED] ***';
        }

        scope.setExtra('body', request.body);
        scope.setExtra('query', request.query);
        scope.setExtra('params', request.params);

        if (request.user) {
          scope.setUser({ id: request.user.sub, email: request.user.email });
        }

        Sentry.captureException(exception);
      });
    }

    super.catch(exception, host);
  }
}
