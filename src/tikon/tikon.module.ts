import { Module } from '@nestjs/common';
import { TikonService } from './tikon.service';
import { TikonController } from './tikon.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tikon } from './entity/tikon.entity';
import { User } from 'src/user/entity/user.entity';
import { UtilModule } from 'src/util/util.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tikon, User]), UtilModule],
  controllers: [TikonController],
  providers: [TikonService],
})
export class TikonModule {}
