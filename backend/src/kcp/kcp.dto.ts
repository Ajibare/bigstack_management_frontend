import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKcpDto {
  @IsString() @IsNotEmpty() name: string;
  @Type(() => Number) @IsNumber() feeToPay: number;
  @Type(() => Number) @IsNumber() amountPaid: number;
  @Type(() => Number) @IsNumber() balance: number;
  @IsString() @IsNotEmpty() date: string;
  @IsString() @IsNotEmpty() age: string;
}

export class UpdateKcpDto extends CreateKcpDto {}
