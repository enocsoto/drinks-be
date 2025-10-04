// src/modules/sales/entities/sale-history.entity.ts (MANTENIDA)

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Sale } from "./sale.entity";
import { User } from "../../user/entities/user.entity";

@Table({ tableName: "sale_history", timestamps: true })
export class SaleHistory extends Model {
  // --- Relación con Sale ---
  @ForeignKey(() => Sale)
  @Column({ allowNull: false })
  saleId: number;

  @BelongsTo(() => Sale)
  sale: Sale;

  // --- Relación con el User que actualizó ---
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  updatedByUserId: string;

  @BelongsTo(() => User)
  updatedByUser: User;

  @Column({ type: DataType.JSON, allowNull: false })
  previousData: any;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Describe el cambio realizado, ej: "Cantidad actualizada de 5 a 3"',
  })
  changeDescription: string;
}
