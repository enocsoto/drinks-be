import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SaleHistory } from './entities/SaleHistory';
import { Sale } from './entities/sale.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Sale, SaleHistory])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
