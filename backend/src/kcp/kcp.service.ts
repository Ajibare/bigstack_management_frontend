import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kcp, KcpDocument } from './kcp.schema';
import { CreateKcpDto, UpdateKcpDto } from './kcp.dto';

@Injectable()
export class KcpService {
  constructor(
    @InjectModel(Kcp.name)
    private readonly model: Model<KcpDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`KCP record #${id} not found`);
    return record;
  }

  async create(dto: CreateKcpDto) {
    const count = await this.model.countDocuments();
    const sn = `BST-KC${String(count + 1).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateKcpDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`KCP record #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`KCP record #${id} not found`);
    return record;
  }
}
