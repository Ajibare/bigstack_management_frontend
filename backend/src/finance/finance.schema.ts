import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FinanceEntryDocument = HydratedDocument<FinanceEntry>;

@Schema({ timestamps: true, collection: 'finance_entries' })
export class FinanceEntry {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0 })
  credit: number;

  @Prop({ default: 0 })
  debit: number;

  @Prop({ default: 0 })
  balance: number;
}

export const FinanceEntrySchema = SchemaFactory.createForClass(FinanceEntry);
