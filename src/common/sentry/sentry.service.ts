import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class SentryService {
  captureException(exception: unknown, request: Request): void {
    this.captureToSentry(exception, request);
  }

  private captureToSentry(exception: unknown, request: Request): void {
    Sentry.withScope((scope) => {
      const sanitizedBody = this.sanitizeRequestBody(request.body);

      scope.setExtra('body', sanitizedBody);
      scope.setExtra('query', request.query);
      scope.setExtra('params', request.params);
      scope.setExtra('ip', request.ip);

      if (request.user) {
        scope.setUser({
          id: request.user.sub,
          email: request.user.email,
        });
      }

      Sentry.captureException(exception);
    });
  }

  private sanitizeRequestBody(
    body: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    if (!body) {
      return {};
    }

    const sanitizedBody = { ...body };

    const sensitiveFields = [
      'password',
      'passwordConfirm',
      'token',
      'refreshToken',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitizedBody) {
        sanitizedBody[field] = '[REDACTED]';
      }
    }

    return sanitizedBody;
  }
}
