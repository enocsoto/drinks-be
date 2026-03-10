import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { User, UserDocument } from "../user/schemas/user.schema";
import { Beverage, BeverageDocument } from "../beverage/schemas/beverage.schema";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "../sales/schemas/sale-detail.schema";
import { USER_SEED_DATA } from "./seeds/user.seed.data";
import { ContainerType } from "../beverage/enum/container-type.enum";
import { BEVERAGE_SEED_DATA, getBeverageImageUrl } from "./seeds/beverage.seed.data";

@Injectable()
export class DatabaseSeedService {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Beverage.name)
    private readonly beverageModel: Model<BeverageDocument>,
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name)
    private readonly saleDetailModel: Model<SaleDetailDocument>,
  ) {}

  async seedUsers(): Promise<void> {
    // Limpiar colección de usuarios para recargar desde cero.
    const deleted = await this.userModel.deleteMany({}).exec();
    this.logger.log(`Usuarios: ${deleted.deletedCount} documento(s) eliminado(s).`);

    for (const item of USER_SEED_DATA) {
      await this.userModel.create({
        name: item.name,
        document: item.document,
        password: bcrypt.hashSync(item.password, 10),
        role: item.role,
        isActive: true,
      });
      this.logger.log(`Usuario creado: ${item.name} (documento ${item.document}).`);
    }
  }

  async seedBeverages(): Promise<void> {
    // Limpiar colección de bebidas para recargar desde cero (evita duplicados con/sin acentos).
    const deleted = await this.beverageModel.deleteMany({}).exec();
    this.logger.log(`Bebidas: ${deleted.deletedCount} documento(s) eliminado(s).`);

    // Eliminar índice único obsoleto solo en "name" si existe (permite mismo nombre con distinto envase).
    try {
      await this.beverageModel.collection.dropIndex("name_1");
      this.logger.log("Índice obsoleto name_1 eliminado.");
    } catch {
      // No existe o ya se eliminó; ignorar.
    }

    for (const item of BEVERAGE_SEED_DATA) {
      const imageUrl = getBeverageImageUrl(item.name, item.containerType);
      await this.beverageModel.create({
        name: item.name,
        price: item.price,
        type: item.type,
        containerType: item.containerType,
        containerSize: item.containerSize,
        stock: item.stock ?? 0,
        costPrice: item.costPrice ?? 0,
        imageUrl,
        isActive: true,
      });
      this.logger.log(
        `Bebida creada: ${item.name} - ${item.containerSize} ($${item.price} COP, stock ${item.stock ?? 0}).`,
      );
    }
  }

  /**
   * Actualiza solo imageUrl en todas las bebidas existentes (sin borrar datos).
   */
  async seedBeverageImages(): Promise<void> {
    const beverages = await this.beverageModel.find({}).lean().exec();
    this.logger.log(`Actualizando imageUrl en ${beverages.length} bebida(s).`);
    for (const b of beverages) {
      const imageUrl = getBeverageImageUrl(b.name, b.containerType ?? ContainerType.OTRO);
      await this.beverageModel.updateOne({ _id: b._id }, { $set: { imageUrl } }).exec();
      if (imageUrl) this.logger.log(`  ${b.name} (${b.containerSize}) → ${imageUrl}`);
    }
    this.logger.log("Seed de imágenes finalizado.");
  }

  /**
   * Limpia ventas y detalles para dejar el dashboard en cero (desarrollo/demo).
   */
  async clearSales(): Promise<void> {
    const [deletedDetails, deletedSales] = await Promise.all([
      this.saleDetailModel.deleteMany({}).exec(),
      this.saleModel.deleteMany({}).exec(),
    ]);
    this.logger.log(
      `Ventas: ${deletedSales.deletedCount} venta(s) y ${deletedDetails.deletedCount} detalle(s) eliminados.`,
    );
  }

  async run(): Promise<void> {
    this.logger.log("Limpiando ventas (para dejar dashboard en cero)...");
    await this.clearSales();
    this.logger.log("Iniciando seed de usuarios...");
    await this.seedUsers();
    this.logger.log("Seed de usuarios finalizado.");
    this.logger.log("Iniciando seed de bebidas...");
    await this.seedBeverages();
    this.logger.log("Seed de bebidas finalizado.");
  }
}
