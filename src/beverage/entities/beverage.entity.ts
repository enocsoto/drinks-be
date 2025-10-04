import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Sale } from "../../sales/entities/sale.entity";
import { DrinkType } from "../enum/drink-type.enum";

// Atributos completos de la entidad Beverage
export interface BeverageAttributes {
  id?: number;
  name: string;
  price: number;
  type: DrinkType;
  isActive?: boolean;
}

// Atributos requeridos para la creación (no incluir id ni campos con default)
export type BeverageCreationAttributes = Omit<BeverageAttributes, 'id' | 'isActive'>;

@Table({
  tableName: "beverages",
  timestamps: true,
  paranoid: true,
})
export class Beverage extends Model<Beverage, BeverageCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.ENUM(...Object.values(DrinkType)),
    defaultValue: DrinkType.ALCOHOLIC,
    allowNull: false,
  })
  type: DrinkType;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  isActive: boolean;

  // @HasMany(() => Sale)
  // sales: Sale[];

  //  @HasMany(() => SaleDetail)
  // saleDetails: SaleDetail[];
}
