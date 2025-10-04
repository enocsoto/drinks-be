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
   * Create a user used by AuthService.register (accepts RegisterDto shape)
   */
  async createUser(payload: { name: string; email: string; password: string; document: string }) {
    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.userModel.create({
      name: payload.name,
      email: payload.email,
      document: payload.document,
      password: hashed,
    });
    // remove password from returned object
    // @ts-ignore
    delete user.dataValues.password;
    return user;
  }

  /**
   * Validate user credentials and return the user when valid
   */
  async validateUserCredentials(document: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { document } });
    if (!user) return null;
    // password column has a getter that hides the value, read raw value
    const stored = (user as any).getDataValue ? (user as any).getDataValue('password') : (user as any).password;
    const match = await bcrypt.compare(password, stored);
    if (!match) return null;
    // remove password before returning
    // @ts-ignore
    delete user.dataValues.password;
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
