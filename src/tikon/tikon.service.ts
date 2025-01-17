import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTikonDto } from './dto/create-tikon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tikon } from './entity/tikon.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { User } from 'src/user/entity/user.entity';
import { UserNotFoundException } from 'src/exception/error/user-not-found.exception';
import { S3Service } from 'src/util/service/s3.service';
import { FindTikonDto } from './dto/find-tikon.dto';
import { TikonNotFoundException } from 'src/exception/error/tikon-not-found.exception';

@Injectable()
export class TikonService {
  constructor(
    @InjectRepository(Tikon)
    private readonly tikonRepository: Repository<Tikon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    jwtPayload: JwtPayload,
    image: Express.Multer.File,
    createTikonDto: CreateTikonDto,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const { tikonName, storeName, discount, category, dDay } = createTikonDto;
      const user = await this.userRepository.findOne({
        where: { email: jwtPayload.email },
      });

      if (!user) throw new UserNotFoundException();

      const imageUrl = await this.s3Service.imageUploadToS3(image);

      const tikon = await this.tikonRepository.save({
        image: imageUrl,
        tikonName,
        storeName,
        discount,
        category,
        dDay,
        user,
      });

      await qr.commitTransaction();
      return tikon;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findAll(jwtPayload: JwtPayload, findTikonDto: FindTikonDto) {
    const takeNumber = 10;
    const { email } = jwtPayload;
    const { page = 0 } = findTikonDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    return await this.tikonRepository.find({
      where: { user, available: true },
      order: { dDay: 'ASC', createdAt: 'ASC' },
      take: takeNumber,
      skip: page * takeNumber,
    });
  }

  async useTikon(jwtPayload: JwtPayload, id: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { email } = jwtPayload;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new UserNotFoundException();

      const tikon = await this.tikonRepository.findOne({ where: { id, user } });
      if (!tikon) throw new TikonNotFoundException();

      tikon.available = !tikon.available;

      await this.tikonRepository.save(tikon);

      await qr.commitTransaction();
      return tikon.available;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
