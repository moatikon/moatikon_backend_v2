import { Module } from '@nestjs/common';
import { S3Service } from './service/s3.service';
import { FcmService } from './service/fcm.service';

@Module({
  imports: [],
  providers: [S3Service, FcmService],
  exports: [S3Service, FcmService],
})
export class UtilModule {}
