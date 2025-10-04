import { Module } from '@nestjs/common';
import { WaiterService } from './waiter.service';
import { WaiterController } from './waiter.controller';

@Module({
  controllers: [WaiterController],
  providers: [WaiterService],
})
export class WaiterModule {}
