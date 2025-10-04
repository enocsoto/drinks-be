import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  /**
   * Create a new user (used by UserController)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto as any;
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ ...rest, password: hashed });
    return user;
  }

  /**
   * Create a user used by AuthService.register (accepts RegisterDto shape)
   */
  async createUser(payload: { name: string; email: string; password: string }) {
    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.userModel.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
    });
    return user;
  }

  /**
   * Validate user credentials and return the user when valid
   */
  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) return null;
    const match = await bcrypt.compare(password, (user as any).password);
    if (!match) return null;
    return user;
  }

  /**
   * Find a user by primary key (id)
   */
  async findUser(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id);
    if (!user) return null;
    return user;
  }

  async findAll() {
    return this.userModel.findAll({ attributes: { exclude: ['password'] } });
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | void> {
    const {isActive, ...rest}= updateUserDto;
    const user = await this.findOne(id);
    if (!isActive){
      user.isActive = false
      return user.save();
    }
    await user.update(rest);
    return user;
  }


}
