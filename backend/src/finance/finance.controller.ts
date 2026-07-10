import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceEntryDto, UpdateFinanceEntryDto } from './finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateFinanceEntryDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateFinanceEntryDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
