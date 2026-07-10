import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ItStudentsService } from './it-students.service';
import { CreateItStudentDto, UpdateItStudentDto } from './it-student.dto';

@Controller('it-students')
export class ItStudentsController {
  constructor(private readonly service: ItStudentsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateItStudentDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateItStudentDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
