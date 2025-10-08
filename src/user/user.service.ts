import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
  ) {}

  /**
   * Create a user used by AuthService.register (accepts RegisterDto shape)
   */
  async createUser(payload: CreateUserDto) {
    const { password, ...rest } = payload;
    try {
      const user: User = await this.userRepository.create({
        password: bcrypt.hashSync(password, 10),
        ...rest,
      });
      const safeUser = user.toJSON();
      delete safeUser.password;
      return safeUser;
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user: ${error.message}`);
    }
  }


  /**
   * Find a user by primary key (id)
   */
  async findUserByCriteria(term: string | number): Promise<User | null> {
    let where = {};
    if (typeof +term === "number") {
      where = { document: term, isActive: true };
    } else {
      where = { id: term, isActive: true };
    }
    const user = await this.userRepository.findOne({ where });
    if (!user) return null;
    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findByPk(id, { attributes: { exclude: ["password"] } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | void> {
    const { isActive, ...rest } = updateUserDto;
    const user = await this.findOne(id);
    if (!isActive) {
      user.isActive = false;
      return user.save();
    }
    await user.update(rest);
    return user;
  }
}
