import { Injectable } from '@nestjs/common';
import { CreateTikonDto } from './dto/create-tikon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tikon } from './entity/tikon.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { User } from 'src/user/entity/user.entity';
import { UserNotFoundException } from 'src/exception/error/user-not-found.exception';
import { S3Service } from 'src/util/service/s3.service';

@Injectable()
export class TikonService {
  constructor(
    @InjectRepository(Tikon)
    private readonly tikonRepository: Repository<Tikon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly s3Service: S3Service,
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

    if (!user) throw new UserNotFoundException();

    const imageUrl = await this.s3Service.imageUploadToS3(image);

    const tikon = this.tikonRepository.create({
      image: imageUrl,
      tikonName,
      storeName,
      discount,
      category,
      dDay,
      user,
    });

    return await this.tikonRepository.save(tikon);
  }

  async findAll(jwtPayload: JwtPayload, page: number) {
    const takeNumber = 10;
    const { email } = jwtPayload;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    return await this.tikonRepository.find({
      where: { user },
      order: { dDay: 'ASC', createdAt: 'ASC' },
      take: takeNumber,
      skip: page * takeNumber
    }); 
  }
}
