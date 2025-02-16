import { Request } from 'express';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();
    const res = ctx.getResponse();

    const status = 400;

    res.status(status).json({
      statusCode: status,
      message: exception['response']['message'][0],
      path: req.path,
      timestamp: new Date().toString(),
    });
  }
}
