import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { NewUserDto } from './users.dto';
import { isNil } from '@nestjs/common/utils/shared.utils';

interface updateDto {
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(user: NewUserDto): Promise<User | null> {
    // check if the email already exists in the association
    const existingUser = await this.findOneByEmail(user.email);
    if (existingUser) {
      throw new UnprocessableEntityException('Email already exists');
    }

    // insert user into the database
    const result = await this.userRepository.insert({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      passwordHash: await this.passwordToHash(user.password),
      role: user.role,
    });
    const userId = result.generatedMaps[0].id;

    // return the newly created user
    return this.userRepository.findOneBy({ id: userId });
  }

  /*async sendPasswordResetEmail(id: string) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = uuidv4();
    user.passwordResetCode = code;
    console.log(code);
    await this.userRepository.save(user);
    this.emailService.sendPasswordResetEmail({
      email: user.email,
      fullName: user.fullName,
      passwordResetCode: code,
    });

    return user.email;
  }*/

  async updateUser(newData: updateDto): Promise<User> {
    const user = await this.findOneById(newData.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (newData.fullName) {
      user.fullName = newData.fullName;
    }

    if (newData.phone) {
      user.phone = newData.phone;
    }

    if (newData.email) {
      const emailDouble = await this.findOneByEmail(newData.email);

      if (newData.email && isNil(emailDouble)) {
        console.log(newData.email && isNil(emailDouble));
        user.email = newData.email;
      } else {
        throw new Error('Email already exist');
      }
    }

    await this.userRepository.save(user);

    return user;
  }

  async makeUserAdmin(userId: string): Promise<User> {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;

    await this.userRepository.save(user);

    return user;
  }
  async makeUserHost(userId: string): Promise<User> {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.HOST;

    await this.userRepository.save(user);

    return user;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.userRepository.remove(user);
    return deletedUser;
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email: email },
    });
  }
  async findOneById(id: string) {
    return this.userRepository.findOne({
      where: { id: id },
    });
  }

  private async passwordToHash(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }
}
