import {UserRole} from "./users.entity";

export interface ResetPasswordDto {
  passwordResetCode: string;
  newPassword: string;
}
export interface NewUserDto {
  email: string;
  phone?: string;
  password?: string;
  fullName?: string;
  role: UserRole;
}
