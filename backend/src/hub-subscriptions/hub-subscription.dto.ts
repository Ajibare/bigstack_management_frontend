import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHubSubscriptionDto {
  @IsString() @IsNotEmpty() name: string;
  @Type(() => Number) @IsNumber() amountPaid: number;
  @IsString() @IsNotEmpty() duration: string;
  @IsString() @IsNotEmpty() date: string;
}

export class UpdateHubSubscriptionDto extends CreateHubSubscriptionDto {}
