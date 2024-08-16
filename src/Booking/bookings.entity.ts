import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Property } from '../Property/property.entity';
import { User } from '../users/users.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.booking, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (user) => user.bookings)
  traveler: User;

  @Column()
  arriva: Date;

  @Column()
  depart: Date;

  @CreateDateColumn()
  createdAt: Date;
}
