import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceEntry, FinanceEntrySchema } from './finance.schema';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FinanceEntry.name, schema: FinanceEntrySchema }])],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
