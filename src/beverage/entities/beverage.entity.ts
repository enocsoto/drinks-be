import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Sale } from "src/sales/entities/sale.entity";

@Table({
  tableName: "beverages",
  timestamps: true,
  paranoid: true,
})
export class Beverage extends Model {
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

  @HasMany(() => Sale)
  sales: Sale[];
}
