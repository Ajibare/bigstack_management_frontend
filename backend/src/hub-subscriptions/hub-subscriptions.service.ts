import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HubSubscription, HubSubscriptionDocument } from './hub-subscription.schema';
import { CreateHubSubscriptionDto, UpdateHubSubscriptionDto } from './hub-subscription.dto';

@Injectable()
export class HubSubscriptionsService {
  constructor(
    @InjectModel(HubSubscription.name)
    private readonly model: Model<HubSubscriptionDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Subscription #${id} not found`);
    return record;
  }

  async create(dto: CreateHubSubscriptionDto) {
    const count = await this.model.countDocuments();
    const sn = `BST-HB${String(count + 1).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateHubSubscriptionDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`Subscription #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`Subscription #${id} not found`);
    return record;
  }
}
