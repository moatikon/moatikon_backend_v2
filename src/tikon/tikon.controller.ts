import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { TikonService } from './tikon.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetPayload } from 'src/common/decorator/get-jwt-payload.decorator';
import { JwtPayload } from 'src/common/interface/jwt-payload';
import { FindTikonRequest } from './request/find-tikon.request';
import { IdValidatePipe } from 'src/common/pipe/id-validate.pipe';
import { CreateTikonRequest } from './request/create-tikon.request';
import { UpdateTikonRequest } from './request/update-tikon.request';

@Controller('tikon')
export class TikonController {
  constructor(private readonly tikonService: TikonService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @GetPayload() jwtPayload: JwtPayload,
    @UploadedFile() image: Express.Multer.File,
    @Body() createTikonDto: CreateTikonRequest,
  ) {
    return this.tikonService.create(jwtPayload, image, createTikonDto);
  }

  @Get()
  findAll(
    @GetPayload() jwtPayload: JwtPayload,
    @Query() findTikonDto: FindTikonRequest,
  ) {
    return this.tikonService.findAll(jwtPayload, findTikonDto);
  }

  @Patch('/toggle/:id')
  toggleTiconStatus(
    @GetPayload() jwtPayload: JwtPayload,
    @Param('id', IdValidatePipe) id: string,
  ) {
    return this.tikonService.useTikon(jwtPayload, id);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateTikon(
    @GetPayload() jwtPayload: JwtPayload,
    @Param('id', IdValidatePipe) id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateTikonRequest: UpdateTikonRequest,
  ) {
    return this.tikonService.updateTikon(
      jwtPayload,
      id,
      image,
      updateTikonRequest,
    );
  }

  @Delete('/:id')
  deleteTikon(
    @GetPayload() jwtPayload: JwtPayload,
    @Param('id', IdValidatePipe) id: string,
  ) {
    return this.tikonService.deleteTikon(jwtPayload, id);
  }
}
