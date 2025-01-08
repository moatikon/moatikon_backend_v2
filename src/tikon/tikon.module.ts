import { Module } from '@nestjs/common';
import { TikonService } from './tikon.service';
import { TikonController } from './tikon.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tikon } from './entity/tikon.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tikon, User])],
  controllers: [TikonController],
  providers: [TikonService],
})
export class TikonModule {}
