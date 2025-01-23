import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FindTikonDto {
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  page?: number;

  @IsNumber()
  @IsIn([0, 1])
  @IsNotEmpty()
  @IsOptional()
  available?: number;
}
