import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany } from "sequelize-typescript";
import { Sale } from "../../sales/entities/sale.entity";

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  role: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_sign_in_at: Date;

  @HasMany(() => Sale)
  sales: Sale[];
}
