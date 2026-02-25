import { Module } from '@nestjs/common';
import { BeverageService } from './beverage.service';
import { BeverageController } from './beverage.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Beverage } from './entities/beverage.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Beverage]),
    AuthModule, // Para @Auth() en BeverageController
  ],
  controllers: [BeverageController],
  providers: [BeverageService],
  exports: [BeverageService],
})
export class BeverageModule {}
