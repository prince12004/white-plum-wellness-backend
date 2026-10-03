import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

interface MongoServerErrorLike {
  name?: string;
  code?: number;
  keyValue?: Record<string, unknown>;
}

/**
 * Single global catch-all filter. Nest dispatches by matching thrown exception
 * against registered filters' @Catch() types in registration order — splitting this
 * across multiple filters risks ambiguous matches (e.g. a bare @Catch() filter would
 * also swallow HttpExceptions), so all translation logic lives in one place.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string' ? body : ((body as Record<string, unknown>).message ?? exception.message);
      const error =
        typeof body === 'object' && body !== null && 'error' in body
          ? (body as Record<string, unknown>).error
          : HttpStatus[status];

      return response.status(status).json({
        statusCode: status,
        message,
        error,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    const mongoErr = exception as MongoServerErrorLike;

    if (mongoErr?.code === 11000) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `Duplicate value for: ${Object.keys(mongoErr.keyValue ?? {}).join(', ')}`,
        error: 'Conflict',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof MongooseError.CastError || exception instanceof MongooseError.ValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'Bad Request',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
