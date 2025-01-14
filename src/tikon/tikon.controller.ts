import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TikonService } from './tikon.service';
import { CreateTikonDto } from './dto/create-tikon.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetPayload } from 'src/common/decorator/get-jwt-payload.decorator';
import { JwtPayload } from 'src/common/interface/jwt-payload';

@Controller('tikon')
export class TikonController {
  constructor(private readonly tikonService: TikonService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @GetPayload() jwtPayload: JwtPayload,
    @UploadedFile() image: Express.Multer.File,
    @Body() createTikonDto: CreateTikonDto,
  ) {
    return this.tikonService.create(jwtPayload, image, createTikonDto);
  }
}
