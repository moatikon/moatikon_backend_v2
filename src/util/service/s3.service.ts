import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  s3BucketName: string;

  constructor(private readonly configService: ConfigService) {
    const s3BucketName = configService.get('S3_BUCKET_NAME');
    this.s3BucketName = s3BucketName;
  }

  s3Client: S3Client = new S3Client({
    region: this.configService.get('S3_REGION'),
    credentials: {
      accessKeyId: this.configService.get('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
    },
  });

  #base64Encodeing(originalname: string): string {
    const buffer = Buffer.from(originalname + uuid(), 'utf-8');
    const encoded = buffer.toString('base64url');

    return encoded;
  }

  async imageUploadToS3(image: Express.Multer.File): Promise<string> {
    const filename = this.#base64Encodeing(image.originalname);
    const ext: string = image.mimetype.split('/')[1];

    const commend = new PutObjectCommand({
      Bucket: this.s3BucketName,
      Key: `${filename}.${ext}`,
      Body: image.buffer,
      ACL: 'public-read-write',
      ContentType: image.mimetype,
    });

    this.s3Client.send(commend);
    return `https://s3.${this.configService.get('S3_REGION')}.amazonaws.com/${this.s3BucketName}/${filename}.${ext}`;
  }

  async imageDeleteToS3(image: string): Promise<void> {
    const tikonImageKey = image.split('/')[4];

    const commend = new DeleteObjectsCommand({
      Bucket: this.s3BucketName,
      Delete: { Objects: [{ Key: tikonImageKey }] },
    });

    await this.s3Client.send(commend);
  }
}
