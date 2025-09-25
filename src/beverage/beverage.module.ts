import { Module } from '@nestjs/common';
import { BeverageService } from './beverage.service';
import { BeverageController } from './beverage.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Beverage } from './entities/beverage.entity';

@Module({
  imports: [SequelizeModule.forFeature([Beverage])],
  controllers: [BeverageController],
  providers: [BeverageService],
})
export class BeverageModule {}
