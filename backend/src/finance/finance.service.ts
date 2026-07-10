import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FinanceEntry, FinanceEntryDocument } from './finance.schema';
import { CreateFinanceEntryDto, UpdateFinanceEntryDto } from './finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(FinanceEntry.name)
    private readonly model: Model<FinanceEntryDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Finance entry #${id} not found`);
    return record;
  }

  create(dto: CreateFinanceEntryDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateFinanceEntryDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`Finance entry #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`Finance entry #${id} not found`);
    return record;
  }
}
