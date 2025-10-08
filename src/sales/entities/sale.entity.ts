import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { User } from "../../user/entities/user.entity";
import { SaleDetail } from "./sale-detail.entity";
import { SaleHistory } from "./sale-history.entity";

@Table({ tableName: "sales", timestamps: true, paranoid: true })
export class Sale extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  // --- Manejar quién La vendió ---
  // this FK references User.document (not User.id)
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_document',
    // explicit DB-level reference to the users.document column
    references: { model: 'users', key: 'document' },
  })
  userDocument: number;

  @BelongsTo(() => User, { foreignKey: 'userDocument', targetKey: 'document' })
  user: User;

  // --- Manejar el total del precio (SUMA de todos los detalles) ---
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0, // Se actualizará al agregar detalles
    comment: "Precio total de todos los SaleDetails en esta venta",
  })
  totalPrice: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  DateSale: Date;

  // --- Relaciones a detalles y auditoría ---
  @HasMany(() => SaleDetail)
  details: SaleDetail[]; // Ahora una venta tiene muchos detalles

  @HasMany(() => SaleHistory)
  history: SaleHistory[];
}
