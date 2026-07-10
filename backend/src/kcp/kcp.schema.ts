import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KcpDocument = HydratedDocument<Kcp>;

@Schema({ timestamps: true, collection: 'kcp' })
export class Kcp {
  @Prop({ required: true, unique: true })
  sn: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  feeToPay: number;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  age: string;
}

export const KcpSchema = SchemaFactory.createForClass(Kcp);
