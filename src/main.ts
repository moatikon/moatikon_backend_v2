import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.HTTP_PORT;
  await app.listen(port, () => {
    Logger.log(`Server running on port ${port}`);
  });
}
bootstrap();
