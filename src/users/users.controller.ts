import { Body, Controller, Delete, Param, Patch } from "@nestjs/common";
import { UsersService } from "./users.sercice";
import { User, UserRole } from "./users.entity";
import { z } from "zod";
import { GetUser } from "../auth/decorators/user.decorator";
import { Roles } from "../auth/rules.decorator";

const updateSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
});

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  stripeCustomerId: string;
}

@Controller('user')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Patch('/update/:id')
  async updateUser(
    @GetUser() userget: UserResponse,
    @Body() user: z.infer<typeof updateSchema>,
  ): Promise<UserResponse> {
    const validData = updateSchema.parse(user);
    /*if (!body.userId) {
      throw new UnprocessableEntityException('Please provide a user id.');
    }*/

    const userUpdated = await this.UsersService.updateUser({
      email: validData.email,
      fullName: validData.fullName,
      phone: validData.phone,
      userId: userget.id,
    });

    return {
      id: userUpdated.id,
      email: userUpdated.email,
      fullName: userUpdated.fullName,
      role: userUpdated.role,
      stripeCustomerId: userUpdated.stripeCustomerId,
    };
  }

  @Roles(UserRole.ADMIN)
  @Patch('/upgrade/:id')
  async makeUserAdmin(@Param('id') userId: string) {
    const userUpdated = await this.UsersService.makeUserAdmin(userId);

    return {
      id: userUpdated.id,
      email: userUpdated.email,
      fullName: userUpdated.fullName,
      role: userUpdated.role,
      stripeCustomerId: userUpdated.stripeCustomerId,
    };
  }

  @Delete('/:id')
  async deleteUser(@Param('id') userId: string): Promise<User> {
    const user = await this.UsersService.deleteUser(userId);
    return user;
  }
}
