import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "./dto/create-user.dto";
import { CreateUserByAdminDto } from "./dto/create-user-by-admin.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserDocument } from "./schemas/user.schema";
import { UserRole } from "./enum/user-roles.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Crea un usuario (usado por AuthService.register).
   */
  async createUser(payload: CreateUserDto): Promise<Record<string, unknown>> {
    try {
      const user = await this.userModel.create({
        ...payload,
        password: bcrypt.hashSync(payload.password, 10),
      });
      const json = user.toJSON() as Record<string, unknown>;
      delete json.password;
      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(`Error al crear el usuario: ${message}`);
    }
  }

  /**
   * Crea un usuario por parte de un administrador (permite asignar rol).
   */
  async createUserByAdmin(payload: CreateUserByAdminDto): Promise<Record<string, unknown>> {
    try {
      const role = payload.role ? [payload.role] : [UserRole.SELLER];
      const user = await this.userModel.create({
        name: payload.name,
        document: payload.document,
        password: bcrypt.hashSync(payload.password, 10),
        role,
      });
      const json = user.toJSON() as Record<string, unknown>;
      delete json.password;
      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(`Error al crear el usuario: ${message}`);
    }
  }

  /**
   * Lista todos los usuarios. Por defecto solo activos; con includeInactive también los inactivos.
   */
  async findAll(includeInactive = false): Promise<Record<string, unknown>[]> {
    const filter = includeInactive ? {} : { isActive: true };
    const users = await this.userModel
      .find(filter)
      .select("-password")
      .sort({ name: 1 })
      .lean()
      .exec();
    return users.map((u: { _id: { toString: () => string }; [key: string]: unknown }) => ({
      ...u,
      id: (u._id as { toString: () => string }).toString(),
    })) as Record<string, unknown>[];
  }

  /**
   * Busca usuario por documento (número) o por id (ObjectId).
   */
  async findUserByCriteria(term: string | number): Promise<UserDocument | null> {
    const isDocument = typeof term === "number" || !Number.isNaN(Number(term));
    if (isDocument) {
      return this.userModel
        .findOne({ document: Number(term), isActive: true })
        .select("+password")
        .exec();
    }
    return this.userModel.findById(term).select("+password").exec();
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const user = await this.userModel.findById(id).select("-password").exec();
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }
    return user.toJSON() as Record<string, unknown>;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Record<string, unknown>> {
    const user = await this.userModel.findById(id).select("+password").exec();
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }
    const { isActive, password, ...rest } = updateUserDto;
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }
    if (password != null && password.trim() !== "") {
      user.password = bcrypt.hashSync(password, 10);
    }
    if (Object.keys(rest).length > 0) {
      Object.assign(user, rest);
    }
    await user.save();
    const updated = await this.userModel.findById(id).select("-password").exec();
    return updated!.toJSON() as Record<string, unknown>;
  }
}
