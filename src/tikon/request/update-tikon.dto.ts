import { PartialType } from '@nestjs/mapped-types';
import { CreateTikonDto } from './create-tikon.dto';

export class UpdateTikonDto extends PartialType(CreateTikonDto) {}
