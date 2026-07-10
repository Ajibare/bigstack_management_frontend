import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFinanceEntryDto {
  @IsString() @IsNotEmpty() date: string;
  @IsString() @IsNotEmpty() description: string;
  @Type(() => Number) @IsNumber() credit: number;
  @Type(() => Number) @IsNumber() debit: number;
  @Type(() => Number) @IsNumber() balance: number;
}

export class UpdateFinanceEntryDto extends CreateFinanceEntryDto {}
