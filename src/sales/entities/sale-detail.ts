import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Sale } from "./sale.entity";
import { Beverage } from "../../beverage/entities/beverage.entity";

@Table({
  tableName: "sale_details",
  timestamps: false, // Los detalles heredan los timestamps de la Sale
})
export class SaleDetail extends Model<SaleDetail> {
  // --- Claves Foráneas ---

  @ForeignKey(() => Sale)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  saleId: number;

  @BelongsTo(() => Sale)
  sale: Sale;

  @ForeignKey(() => Beverage)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  beverageId: number;

  @BelongsTo(() => Beverage)
  beverage: Beverage;

  // --- Atributos de Detalle ---

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  // IMPORTANTE: Almacenar el precio unitario AL MOMENTO de la venta
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice: number; 

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  subtotal: number; // quantity * unitPrice
}
