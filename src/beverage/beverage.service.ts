import { Injectable } from '@nestjs/common';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { UpdateBeverageDto } from './dto/update-beverage.dto';

@Injectable()
export class BeverageService {
  create(createBeverageDto: CreateBeverageDto) {
    return 'This action adds a new beverage';
  }

  findAll() {
    return `This action returns all beverage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beverage`;
  }

  update(id: number, updateBeverageDto: UpdateBeverageDto) {
    return `This action updates a #${id} beverage`;
  }

  remove(id: number) {
    return `This action removes a #${id} beverage`;
  }
}
