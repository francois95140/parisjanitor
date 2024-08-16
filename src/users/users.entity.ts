import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Property } from '../Property/property.entity';
import { Booking } from '../Booking/bookings.entity';

export enum UserRole {
  HOST = 'host',
  ADMIN = 'admin',
  TRAVELER = 'traveler',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  @Column({ nullable: true })
  passwordResetCode?: string;

  @Column({ default: null })
  stripeCustomerId: string;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.TRAVELER })
  role: UserRole;

  @OneToMany(() => Booking, (booking) => booking.traveler)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;
}
