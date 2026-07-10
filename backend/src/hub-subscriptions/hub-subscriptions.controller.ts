import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HubSubscriptionsService } from './hub-subscriptions.service';
import { CreateHubSubscriptionDto, UpdateHubSubscriptionDto } from './hub-subscription.dto';

@Controller('hub-subscriptions')
export class HubSubscriptionsController {
  constructor(private readonly service: HubSubscriptionsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateHubSubscriptionDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateHubSubscriptionDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
