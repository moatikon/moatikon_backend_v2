import { PartialType } from '@nestjs/mapped-types';
import { CreateTikonRequest } from './create-tikon.request';

export class UpdateTikonRequest extends PartialType(CreateTikonRequest) {}
