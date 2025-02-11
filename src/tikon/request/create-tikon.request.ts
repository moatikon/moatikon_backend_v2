import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { TikonCategory } from 'src/common/enum/tikon-category.enum';

export class CreateTikonRequest {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  tikonName: string;

  @IsNotEmpty()
  @IsEnum(TikonCategory)
  category: TikonCategory;

  @Min(1)
  @Max(100)
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  @IsDateString()
  dDay: string;
}
