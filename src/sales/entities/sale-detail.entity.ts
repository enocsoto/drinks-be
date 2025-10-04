import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Sale } from "./sale.entity";
import { Beverage } from "../../beverage/entities/beverage.entity";

export interface SaleDetailAttributes {
  id?: number;
  saleId: number;
  beverageId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Atributos requeridos para creación
export type SaleDetailCreationAttributes = Omit<SaleDetailAttributes, "id">;

@Table({
  tableName: "sale_details",
  timestamps: false,
})
export class SaleDetail extends Model<SaleDetail, SaleDetailCreationAttributes> {
  @ForeignKey(() => Sale)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  saleId: number;

  // El producto vendido
  @ForeignKey(() => Beverage)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  beverageId: number;

  // --- Manejar la cantidad ---
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  // Precio unitario al momento de la venta (IMPORTANTE)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice: number;

  // --- Manejar el subtotal (Cantidad * Precio Unitario) ---
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  subtotal: number;

  // --- Relaciones ---
  @BelongsTo(() => Sale)
  sale: Sale;

  @BelongsTo(() => Beverage)
  beverage: Beverage;
}
