import { Request } from 'express';
import { HttpException } from './http.exception';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();
    const res = ctx.getResponse();

    const status = exception.getStatus();

    res.status(status).json({
      statusCode: status,
      message: exception.message,
      path: req.path,
      timestamp: new Date().toString(),
    });
  }
}
