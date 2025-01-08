import { Injectable } from '@nestjs/common';
import { CreateTikonDto } from './dto/create-tikon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tikon } from './entity/tikon.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { User } from 'src/user/entity/user.entity';
import { UserNotFoundException } from 'src/exception/error/user-not-found.exception';

@Injectable()
export class TikonService {
  constructor(
    @InjectRepository(Tikon)
    private readonly tikonRepository: Repository<Tikon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    jwtPayload: JwtPayload,
    image: Express.Multer.File,
    createTikonDto: CreateTikonDto,
  ) {
    const { tikonName, storeName, discount, category, dDay } = createTikonDto;
    const user = await this.userRepository.findOne({
      where: { email: jwtPayload.email },
    });

    if(!user) throw new UserNotFoundException();

    const tikon = this.tikonRepository.create({
      image: image.originalname,
      tikonName,
      storeName,
      discount,
      category,
      dDay,
      user
    });

    return await this.tikonRepository.save(tikon);
  }
}
