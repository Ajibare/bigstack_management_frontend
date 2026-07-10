import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HubSubscription, HubSubscriptionSchema } from './hub-subscription.schema';
import { HubSubscriptionsService } from './hub-subscriptions.service';
import { HubSubscriptionsController } from './hub-subscriptions.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: HubSubscription.name, schema: HubSubscriptionSchema }])],
  controllers: [HubSubscriptionsController],
  providers: [HubSubscriptionsService],
})
export class HubSubscriptionsModule {}
