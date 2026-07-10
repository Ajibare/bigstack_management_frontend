import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { KcpService } from './kcp.service';
import { CreateKcpDto, UpdateKcpDto } from './kcp.dto';

@Controller('kcp')
export class KcpController {
  constructor(private readonly service: KcpService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateKcpDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateKcpDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
