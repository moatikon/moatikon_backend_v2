import { Injectable } from '@nestjs/common';
import { CreateTikonRequest } from './request/create-tikon.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Tikon } from './entity/tikon.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { User } from 'src/user/entity/user.entity';
import { UserNotFoundException } from 'src/exception/error/user-not-found.exception';
import { S3Service } from 'src/util/service/s3.service';
import { FindTikonRequest } from './request/find-tikon.request';
import { TikonNotFoundException } from 'src/exception/error/tikon-not-found.exception';
import { TikonFindAllResponse } from './response/tikon_find_all.response';
import { UpdateTikonRequest } from './request/update-tikon.request';
import { InvalidDDayException } from 'src/exception/error/invalid-d-day.exception';

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
    createTikonDto: CreateTikonRequest,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const { tikonName, storeName, discount, category, dDay } = createTikonDto;
      const user = await this.userRepository.findOne({
        where: { email: jwtPayload.email },
      });

      if (!user) throw new UserNotFoundException();

      const date = new Date();
      const dDayDate = new Date(dDay);
      if(date > dDayDate) {
        throw new InvalidDDayException();
      }

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

  async updateTikon(
    jwtPayload: JwtPayload,
    id: string,
    image: Express.Multer.File,
    updateTikonRequest: UpdateTikonRequest,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let s3ImagePath: string;
      const { email } = jwtPayload;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new UserNotFoundException();

      const tikon = await this.tikonRepository.findOne({ where: { id, user } });
      if (!tikon) throw new TikonNotFoundException();

      if(updateTikonRequest.dDay) {
        const date = new Date();
        const dDayDate = new Date(updateTikonRequest.dDay);
        if(date > dDayDate) {
          throw new InvalidDDayException();
        }
      }

      if (image) {
        s3ImagePath = await this.s3Service.imageUploadToS3(image);
        await this.s3Service.imageDeleteToS3(tikon.image);
      } else {
        s3ImagePath = tikon.image;
      }

      await this.tikonRepository.update(id, {
        ...updateTikonRequest,
        image: s3ImagePath,
      });

      await qr.commitTransaction();
      return true;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findAll(jwtPayload: JwtPayload, findTikonDto: FindTikonRequest) {
    const takeNumber = 10;
    const { email } = jwtPayload;
    const { page = 0, available = 1 } = findTikonDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UserNotFoundException();

    return new TikonFindAllResponse(
      await this.tikonRepository.find({
        where: { user, available: available === 1 },
        order: { dDay: 'ASC', createdAt: 'ASC' },
        take: takeNumber,
        skip: page * takeNumber,
      }),
    );
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

  async deleteTikon(jwtPayload: JwtPayload, id: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { email } = jwtPayload;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new UserNotFoundException();

      const tikon = await this.tikonRepository.findOne({ where: { id, user } });
      if (!tikon) throw new TikonNotFoundException();

      await this.s3Service.imageDeleteToS3(tikon.image);
      await this.tikonRepository.delete(id);

      await qr.commitTransaction();
      return true;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
