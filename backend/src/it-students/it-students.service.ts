import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItStudent, ItStudentDocument } from './it-student.schema';
import { CreateItStudentDto, UpdateItStudentDto } from './it-student.dto';

@Injectable()
export class ItStudentsService {
  constructor(
    @InjectModel(ItStudent.name)
    private readonly model: Model<ItStudentDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`IT Student #${id} not found`);
    return record;
  }

  async create(dto: CreateItStudentDto) {
    const count = await this.model.countDocuments();
    const sn = `BST-RG${String(count + 1).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateItStudentDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`IT Student #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`IT Student #${id} not found`);
    return record;
  }
}
