import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ItStudentDocument = HydratedDocument<ItStudent>;

@Schema({ timestamps: true, collection: 'it_students' })
export class ItStudent {
  @Prop({ required: true, unique: true })
  sn: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  university: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  level: string;

  @Prop({ default: 0 })
  feeToPay: number;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ required: true })
  date: string;
}

export const ItStudentSchema = SchemaFactory.createForClass(ItStudent);
