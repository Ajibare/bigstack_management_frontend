import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kcp, KcpSchema } from './kcp.schema';
import { KcpService } from './kcp.service';
import { KcpController } from './kcp.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Kcp.name, schema: KcpSchema }])],
  controllers: [KcpController],
  providers: [KcpService],
})
export class KcpModule {}
