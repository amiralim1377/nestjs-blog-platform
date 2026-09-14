import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  apiVersion: string;
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: T | null;
  meta?: any;
  links?: any;
}

@Injectable()
export class DataResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: any) => {
        const message = data?.message || 'درخواست با موفقیت پردازش شد';
        const responseData =
          data?.data !== undefined ? data.data : data || null;
        const isPaginated = data && data.meta && data.links;

        return {
          apiVersion: this.configService.get('appConfig.apiVersion') || '1.0',
          success: true,
          statusCode,
          message,
          timestamp: new Date().toISOString(),
          data: responseData,
          ...(isPaginated && { meta: data.meta, links: data.links }),
        };
      }),
    );
  }
}
