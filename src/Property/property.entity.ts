import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany, ManyToOne
} from "typeorm";
import { Booking } from '../Booking/bookings.entity';
import { User } from "../users/users.entity";

export enum status {
  VALIDE = 'valide',
  VALIDE_4Y = 'valide 4y',
}
export enum type {
  HOME = 'home',
  APARTMENT = 'apartment',
}

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  cp: number;

  @Column()
  price: number;

  @Column({ type: 'simple-enum', enum: type })
  type: type;

  @Column({ default: false })
  isValide: boolean;

  /*@Column({ type: 'simple-enum', enum: status })
  status: status;*/

  @ManyToOne(() => User, (user) => user.properties, { eager: true })
  owner: User;

  @OneToMany(() => Booking, (booking) => booking.property)
  booking: Booking[];

  @CreateDateColumn()
  createdAt: Date;
}
