import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { Beverage } from './entities/beverage.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class BeverageService {
  constructor(
    @InjectModel(Beverage)
    private readonly beverageRepository: typeof Beverage,
  ) {}

  /**
   * Crea una nueva bebida en el catálogo.
   */
  async create(createBeverageDto: CreateBeverageDto): Promise<Beverage> {
    try {
      return await this.beverageRepository.create(createBeverageDto);
    } catch (error) {
      throw new BadRequestException(`Error al crear la bebida: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Beverage> {
    const beverage = await this.beverageRepository.findOne({
      where: { id, isActive: true },
    });
    if (!beverage) {
      throw new NotFoundException(`La bebida con id ${id} no existe.`);
    }
    return beverage;
  }

  async remove(id: number): Promise<boolean> {
    const beverage = await this.beverageRepository.findByPk(id);
    if (!beverage) {
      throw new NotFoundException(`La bebida con id ${id} no existe.`);
    }
    await beverage.update({ isActive: false });
    return true;
  }
}
