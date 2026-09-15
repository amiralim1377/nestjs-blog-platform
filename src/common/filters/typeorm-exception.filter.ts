import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { PostgresErrorCode } from '../enums/postgres-error-codes.enum.js';
import { DbFieldTranslations } from '../constants/database-dictionary.constant.js';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errObj = exception as any;
    const errorCode = errObj.code || errObj.driverError?.code;
    const message = errObj.message || errObj.driverError?.message || '';

    const isUniqueViolation =
      errorCode === PostgresErrorCode.UNIQUE_VIOLATION ||
      errorCode === 'ER_DUP_ENTRY' ||
      errorCode === 'SQLITE_CONSTRAINT' ||
      errorCode === 'SQLITE_CONSTRAINT_UNIQUE' ||
      message.includes('UNIQUE constraint failed');

    if (isUniqueViolation) {
      const detail = errObj.detail || errObj.driverError?.detail || message;
      const match =
        detail.match(/Key \((.*?)\)=/) ||
        detail.match(/UNIQUE constraint failed: (?:.*\.)?(.*)/);
      const duplicateField = match && match[1] ? match[1].trim() : 'field';
      const faFieldName = DbFieldTranslations[duplicateField] || duplicateField;

      return response.status(HttpStatus.CONFLICT).json({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: `مقدار وارد شده برای "${faFieldName}" قبلاً در سیستم ثبت شده است. لطفاً مقدار دیگری انتخاب کنید.`,
        field: duplicateField,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.error('Database Error: ', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'خطایی در ارتباط با پایگاه داده رخ داده است.',
      error: 'Database Error',
      timestamp: new Date().toISOString(),
    });
  }
}
