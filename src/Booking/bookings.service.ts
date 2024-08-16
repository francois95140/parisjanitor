import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Repository,
  Between,
  Not,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './bookings.entity';
import { PropertyService } from '../Property/property.service';

export interface bookingDto {
  arriva: Date;
  depart: Date;
  propertyId: string;
}
export interface updateBookingDto {
  arriva?: Date;
  depart?: Date;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @Inject(forwardRef(() => PropertyService))
    private propertyService: PropertyService,
  ) {}

  async bookProperty(booking: bookingDto): Promise<Booking | null> {
    const property = await this.propertyService.getPropertyById(
      booking.propertyId,
    );

    const overlappingBookings = await this.bookingRepository.findOne({
      where: [
        {
          property: { id: property.id },
          arriva: Between(booking.arriva, booking.depart),
        },
        {
          property: { id: property.id },
          depart: Between(booking.arriva, booking.depart),
        },
        {
          property: { id: property.id },
          arriva: LessThanOrEqual(booking.arriva),
          depart: MoreThanOrEqual(booking.depart),
        },
      ],
    });

    if (overlappingBookings) {
      throw new ConflictException(
        'Property is not available for the selected dates.',
      );
    }

    const result = await this.bookingRepository.insert({
      arriva: booking.arriva,
      depart: booking.depart,
      property: property,
    });
    const bookingId = result.generatedMaps[0].id;

    return this.bookingRepository.findOneBy({ id: bookingId });
  }

  async updateBookingById(
    bookingId: string,
    dto: updateBookingDto,
  ): Promise<Booking> {
    const bookingExiste = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['property'], // Charge explicitement la relation 'property'
    });

    if (!bookingExiste) {
      throw new NotFoundException('booking not found');
    }

    const isAvailable = await this.isReservationModifiable(
      bookingId,
      dto,
      bookingExiste.property.id,
    );
    if (!isAvailable) {
      throw new Error('The new dates overlap with an existing booking');
    }

    if (dto.arriva) {
      bookingExiste.arriva = dto.arriva;
    }
    if (dto.depart) {
      bookingExiste.depart = dto.depart;
    }

    await this.bookingRepository.save(bookingExiste);

    return bookingExiste;
  }

  async cancelBooking(bookingId: string) {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException('booking not found');
    }

    await this.bookingRepository.delete(bookingId);

    return booking;
  }

  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('booking not found');
    }

    return booking;
  }

  async isReservationModifiable(
    bookingId: string,
    dto: updateBookingDto,
    propertyId: string,
  ): Promise<boolean> {
    console.log(bookingId, dto, propertyId);
    const overlappingReservations = await this.bookingRepository.count({
      where: [
        {
          property: { id: propertyId },
          id: Not(bookingId), // Exclut la réservation actuelle
          arriva: Between(dto.arriva, dto.depart),
        },
        {
          property: { id: propertyId },
          id: Not(bookingId), // Exclut la réservation actuelle
          depart: Between(dto.arriva, dto.depart),
        },
        {
          property: { id: propertyId },
          id: Not(bookingId), // Exclut la réservation actuelle
          arriva: LessThanOrEqual(dto.arriva),
          depart: MoreThanOrEqual(dto.depart),
        },
      ],
    });

    console.log(overlappingReservations);
    return overlappingReservations === 0;
  }
}
