import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TikonModule } from './tikon/tikon.module';
import * as Joi from 'joi';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from './util/util.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_SECRET_RE: Joi.string().required(),
        S3_REGION: Joi.string().required(),
        S3_BUCKET_NAME: Joi.string().required(),
        S3_ACCESS_KEY: Joi.string().required(),
        S3_SECRET_ACCESS_KEY: Joi.string().required(),
        FB_PROJECT_ID: Joi.string().required(),
        FB_PRIVATE_KEY: Joi.string().required(),
        FB_CLIENT_EMAIL: Joi.string().required(),
        MAILER_USER: Joi.string().required(),
        MAILER_PW: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    JwtModule.register({}),
    AuthModule,
    UserModule,
    TikonModule,
    CronModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
