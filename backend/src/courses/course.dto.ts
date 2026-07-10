import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @Type(() => Number) @IsNumber() @IsOptional() price?: number;
  @IsString() @IsOptional() duration?: string;
}

export class UpdateCourseDto extends CreateCourseDto {}
