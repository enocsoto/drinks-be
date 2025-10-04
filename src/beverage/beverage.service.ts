import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { Beverage } from './entities/beverage.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class BeverageService {
  constructor(
    @InjectModel(Beverage)
    private beverageRepository: typeof Beverage,
  ) {}

  /**
   * Crea una nueva bebida en el catálogo.
   * @param CreateBeverageDto DTO con los datos de la bebida.
   * @returns La bebida creada.
   */
  async create(createBeverageDto: CreateBeverageDto): Promise<Beverage> {
    try {
      const newBeverage = await this.beverageRepository.create<Beverage>(createBeverageDto);
      return newBeverage;
    } catch (error) {
      throw new BadRequestException(`Error al crear la bebida: ${error.message}`);
    }
  }


  async findOne(id: number): Promise<Beverage> {
    const beverage = await this.beverageRepository.findByPk(id);
    if (!beverage) {
      throw new BadRequestException(`La bebida con id ${id} no existe.`);
    }
    return beverage;
  }

  async remove(id: number): Promise<boolean> {
    const beverage = await this.beverageRepository.update({ isActive: false }, { where: { id } });
    if (beverage[0] === 1) {
      throw new BadRequestException(`La bebida con id ${id} no existe.`);
    }
    return true
  }
}
