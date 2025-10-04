import { Injectable } from '@nestjs/common';
import { CreateWaiterDto } from './dto/create-waiter.dto';
import { UpdateWaiterDto } from './dto/update-waiter.dto';

@Injectable()
export class WaiterService {
  create(createWaiterDto: CreateWaiterDto) {
    return 'This action adds a new waiter';
  }

  findAll() {
    return `This action returns all waiter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} waiter`;
  }

  update(id: number, updateWaiterDto: UpdateWaiterDto) {
    return `This action updates a #${id} waiter`;
  }

  remove(id: number) {
    return `This action removes a #${id} waiter`;
  }
}
