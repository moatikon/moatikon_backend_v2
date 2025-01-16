import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FindTikonDto {
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  page?: number;
}
