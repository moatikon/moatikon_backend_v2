import { Module } from '@nestjs/common';
import { S3Service } from './service/s3.service';
import { FcmService } from './service/fcm.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { MailService } from './service/mail/mail.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './service/redis.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: config.get<string>('MAILER_USER'),
            pass: config.get<string>('MAILER_PW'),
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: 'src/util/service/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.get("REDIS_HOST"),
          port: configService.get("REDIS_PORT"),
          password: configService.get("REDIS_PASSWORD"),
        }
      })
    })
  ],
  providers: [S3Service, FcmService, MailService, RedisService],
  exports: [S3Service, FcmService, MailService, RedisService],
})
export class UtilModule {}
