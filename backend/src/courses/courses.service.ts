import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './course.schema';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly model: Model<CourseDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Course #${id} not found`);
    return record;
  }

  create(dto: CreateCourseDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`Course #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`Course #${id} not found`);
    return record;
  }
}
