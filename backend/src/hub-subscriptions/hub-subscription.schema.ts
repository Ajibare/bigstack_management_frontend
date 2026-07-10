import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HubSubscriptionDocument = HydratedDocument<HubSubscription>;

@Schema({ timestamps: true, collection: 'hub_subscriptions' })
export class HubSubscription {
  @Prop({ required: true, unique: true })
  sn: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  date: string;
}

export const HubSubscriptionSchema = SchemaFactory.createForClass(HubSubscription);
