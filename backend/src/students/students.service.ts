import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly model: Model<StudentDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Student #${id} not found`);
    return record;
  }

  async create(dto: CreateStudentDto) {
    const count = await this.model.countDocuments();
    const sn = `BST-ST${String(count + 1).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateStudentDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`Student #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`Student #${id} not found`);
    return record;
  }
}
