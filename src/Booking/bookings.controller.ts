import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { z } from 'zod';
import { Property } from '../Property/property.entity';
import { PropertyService } from '../Property/property.service';

const addBookedSchema = z
  .object({
    arriva: z.coerce.date().refine((date) => date >= new Date(), {
      message: "The 'arriva' date must be today or later.",
    }),
    depart: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.depart <= data.arriva) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The 'depart' date must be later than the 'arriva' date.",
        path: ['depart'], // This shows the error specifically on the 'depart' field
      });
    }
  });

const updateBookingSchema = z.object({
  arriva: z.coerce.date(),
  depart: z.coerce.date(),
});

interface BookingResponse {
  id: string;
  arriva: Date;
  depart: Date;
  property: Property;
}
@Controller('booking')
export class BookingsController {
  constructor(private readonly BookingService: BookingsService) {}

  @Post('/:id')
  async booked(
    @Param('id') propertyId: string,
    @Body() booking: z.infer<typeof addBookedSchema>,
  ): Promise<BookingResponse> {
    const validBooking = addBookedSchema.parse(booking);

    const newBooking = await this.BookingService.bookProperty({
      arriva: validBooking.arriva,
      depart: validBooking.depart,
      propertyId: propertyId,
    });

    return {
      id: newBooking.id,
      arriva: newBooking.arriva,
      depart: newBooking.depart,
      property: newBooking.property,
    };
  }

  @Patch('/:id')
  async updateBooking(
    @Param('id') bookingId: string,
    @Body() body: z.infer<typeof updateBookingSchema>,
  ): Promise<BookingResponse> {
    const validBooking = addBookedSchema.parse(body);
    /*if (!body.userId) {
      throw new UnprocessableEntityException('Please provide a user id.');
    }*/
    const booking = await this.BookingService.updateBookingById(
      bookingId,
      validBooking,
    );

    return {
      id: booking.id,
      arriva: booking.arriva,
      depart: booking.depart,
      property: booking.property,
    };
  }

  @Delete('/:id')
  async cancelBooking(@Param('id') bookingId: string) {
    const booking = await this.BookingService.cancelBooking(bookingId);

    return booking;
  }
}
