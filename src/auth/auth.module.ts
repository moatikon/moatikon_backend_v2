import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from 'src/util/util.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    UtilModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
