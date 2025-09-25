// src/modules/sales/entities/sale-history.entity.ts

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Sale } from "./sale.entity";
import { User } from "../../user/entities/user.entity";

@Table({ tableName: "sale_history", timestamps: true })
export class SaleHistory extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  // --- Relación con Sale ---
  @ForeignKey(() => Sale)
  @Column({ allowNull: false })
  saleId: number;

  @BelongsTo(() => Sale)
  sale: Sale;

  // --- Relación con el User que actualizó ---
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID, // 👈 CAMBIO AQUÍ
    allowNull: false,
  })
  updatedByUserId: string;

  @BelongsTo(() => User)
  updatedByUser: User;

  @Column({ type: DataType.JSON, allowNull: false })
  previousData: any; // Guardamos el estado anterior de la venta

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Describe el cambio realizado, ej: "Cantidad actualizada de 5 a 3"',
  })
  changeDescription: string;
}
