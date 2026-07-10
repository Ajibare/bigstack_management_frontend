import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  @Prop({ required: true, unique: true })
  sn: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  course: string;

  @Prop({ required: true })
  tutor: string;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  feeToPay: number;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  date: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
