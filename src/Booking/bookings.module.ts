import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './bookings.entity';
import { BookingsService } from './bookings.service';
import { PropertyModule } from '../Property/property.module';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    forwardRef(() => PropertyModule),
  ],
  providers: [BookingsService],
  exports: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
