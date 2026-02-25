import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
  ) {}

  /**
   * Crea un usuario (usado por AuthService.register).
   */
  async createUser(payload: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { password, ...rest } = payload;
    try {
      const user = await this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });
      const safeUser = user.toJSON() as Record<string, unknown>;
      delete safeUser.password;
      return safeUser as Omit<User, 'password'>;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el usuario: ${error.message}`,
      );
    }
  }

  /**
   * Busca usuario por documento (número) o por id (UUID).
   */
  async findUserByCriteria(term: string | number): Promise<User | null> {
    const isDocument = typeof term === 'number' || !Number.isNaN(Number(term));
    const where = isDocument
      ? { document: Number(term), isActive: true }
      : { id: term, isActive: true };
    return this.userRepository.findOne({ where });
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }
    return user.toJSON() as Omit<User, 'password'>;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }
    const { isActive, ...rest } = updateUserDto;
    if (isActive === false) {
      await user.update({ isActive: false });
    } else if (Object.keys(rest).length > 0) {
      await user.update(rest);
    }
    const updated = await this.userRepository.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    return updated!.toJSON() as Omit<User, 'password'>;
  }
}
