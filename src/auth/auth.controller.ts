import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';
import { Public } from './decorators/public.decorator';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string(),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

interface AuthResponse {
  token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/register')
  async register(@Body() body: z.infer<typeof RegisterSchema>): Promise<User> {
    const validBody = RegisterSchema.parse(body);
    const user = await this.authService.createUser({
      email: validBody.email,
      fullName: validBody.fullName,
      password: validBody.password,
      phone: validBody.phone,
    });

    return user;
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: z.infer<typeof LoginSchema>,
  ): Promise<AuthResponse> {
    const validBody = LoginSchema.parse(body);

    const token = await this.authService.login({
      email: validBody.email,
      password: validBody.password,
    });

    return { token };
  }
}
