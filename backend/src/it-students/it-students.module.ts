import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItStudent, ItStudentSchema } from './it-student.schema';
import { ItStudentsService } from './it-students.service';
import { ItStudentsController } from './it-students.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ItStudent.name, schema: ItStudentSchema }])],
  controllers: [ItStudentsController],
  providers: [ItStudentsService],
})
export class ItStudentsModule {}
