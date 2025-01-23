import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { Tikon } from 'src/tikon/entity/tikon.entity';
import { User } from 'src/user/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilModule } from 'src/util/util.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tikon, User]),
    ScheduleModule.forRoot(),
    UtilModule,
  ],
  providers: [CronService],
})
export class CronModule {}
