import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Tikon } from 'src/tikon/entity/tikon.entity';
import { User } from 'src/user/entity/user.entity';
import { S3Service } from 'src/util/service/s3.service';
import { Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tikon)
    private readonly tikonRepository: Repository<Tikon>,

    private readonly s3Service: S3Service,
  ) {}

  @Cron('0 * * * *')
  async deleteUser() {
    const date = new Date();

    const userEmails = (
      await this.userRepository
        .createQueryBuilder('user')
        .select('user.email as email')
        .where('withdrawDate < :date', { date })
        .getRawMany()
    ).map((v) => v.email);

    if (userEmails.length != 0) {
      for (let i = 0; i < userEmails.length; i++) {
        const tikons = await this.tikonRepository
          .createQueryBuilder('tikon')
          .select('tikon.id as id, tikon.image as image')
          .where('tikon.userEmail = :email', { email: userEmails[i] })
          .getRawMany();

        if (tikons.length != 0) {
          await this.tikonRepository.delete(tikons);
    
          for (let i = 0; i < tikons.length; i++) {
            await this.s3Service.imageDeleteToS3(tikons[i].image);
          }
        }
      }

      await this.userRepository.delete(userEmails);
    }
  }

  @Cron('0 0 * * *')
  async deleteExpiredTikons() {
    let date = new Date();
    date = new Date(date.setDate(date.getDate() - 1));

    const tikons = await this.tikonRepository
      .createQueryBuilder('tikon')
      .select('tikon.id as id, tikon.image as image')
      .where('dDay < :date', { date })
      .getRawMany();

    if (tikons.length != 0) {
      await this.tikonRepository.delete(tikons);

      for (let i = 0; i < tikons.length; i++) {
        await this.s3Service.imageDeleteToS3(tikons[i].image);
      }
    }
  }
}
