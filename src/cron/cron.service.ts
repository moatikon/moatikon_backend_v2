import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Tikon } from 'src/tikon/entity/tikon.entity';
import { User } from 'src/user/entity/user.entity';
import { FcmService } from 'src/util/service/fcm.service';
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
    private readonly fcmService: FcmService,
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
  async sendFcmTikons() {
    let date = new Date();
    date = new Date(date.setDate(date.getDate() + 5));

    // 5일 후에 만료되는 Tikon을 가진 사람들
    const users = await this.userRepository
      .createQueryBuilder("user").innerJoin(
        (qb) => qb
          .select("a.userEmail as user")
          .from("tikon", "a")
          .where("a.dDay < :date", { date })
          .andWhere("a.available = true"),
      "tikon",
      "user.email = tikon.user"
    )
    .where("user.available = true")
    .groupBy("user.email")
    .select(["user.email as email", "user.deviceToken as deviceToken", "user.name as name"])
    .getRawMany();

    if (users.length != 0) {
      for (let i = 0; i < users.length; i++) {
        console.log(users[i].email);
        
        await this.fcmService.fcm(
          users[i].deviceToken, 
          "모아티콘 기프티콘 만료알림", 
          `5일 이내에 만료되는 ${users[i].name} 님의 기프티콘이 존재합니다. 서둘러 사용해 주세요!`
        );
      }
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
