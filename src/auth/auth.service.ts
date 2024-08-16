import { User, UserRole } from '../users/users.entity';
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.sercice';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from './decorators/user.decorator';

interface RegisterDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createUser(user: RegisterDto): Promise<User | null> {
    // check if the email already exists in the association
    const existingUser = await this.userService.findOneByEmail(user.email);
    if (existingUser) {
      throw new UnprocessableEntityException('Email already exists');
    }

    // insert user into the database
    const result = await this.userService.createUser({
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      phone: user.phone,
      role: UserRole.TRAVELER,
    });

    // return the newly created user
    return result;
  }

  async login(dto: LoginDto): Promise<string> {
    const MAGIC_PASSWORD = this.configService.get<string>('MAGIC_PASSWORD');

    const user = await this.userService.findOneByEmail(dto.email);

    // No matching email
    if (!user) {
      throw new UnauthorizedException("Email doesn't exist");
    }

    /* ===== FOR TESTING PURPOSE ===== */
    if (dto.password === MAGIC_PASSWORD) {
      const payload = this.userToPayload(user);
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return token;
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException("User doesn't have a password set");
    }

    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Password doesn't match");
    }
    const payload = this.userToPayload(user);
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    return token;
  }

  private userToPayload(user: User): UserPayload {
    const payload: UserPayload = {
      id: user.id,
      role: user.role,
    };

    return payload;
  }
}
