import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Sale } from "../../sales/entities/sale.entity";

@Table({
  tableName: "waiters",
  timestamps: true,
  paranoid: true,
})
export class Waiter extends Model {
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

  @HasMany(() => Sale)
  sales: Sale[];
}