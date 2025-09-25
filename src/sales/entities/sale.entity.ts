// src/modules/sales/entities/sale.entity.ts

import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { Beverage } from "../../beverage/entities/beverage.entity";
import { User } from "../../user/entities/user.entity";
import { SaleHistory } from "./SaleHistory";

@Table({ tableName: "sales", timestamps: true, paranoid: true })
export class Sale extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  // --- Relación con User ---
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  // --- Relación con Beverage ---
  @ForeignKey(() => Beverage)
  @Column({ allowNull: false })
  beverageId: number;

  @BelongsTo(() => Beverage)
  beverage: Beverage;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice: number;

  // --- Relación con SaleHistory ---
  @HasMany(() => SaleHistory)
  history: SaleHistory[];
}
