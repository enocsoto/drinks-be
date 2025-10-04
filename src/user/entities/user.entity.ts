import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany } from "sequelize-typescript";
import { Sale } from "../../sales/entities/sale.entity";
import { UserRole } from "../enum/User-roles.enum";

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
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  document: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.SELLER,
    allowNull: false,
  })
  role: UserRole;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

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
