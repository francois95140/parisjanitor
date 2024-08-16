import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { PropertyService } from './property.service';
import { type } from './property.entity';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserResponse } from '../users/users.controller';
import { UserRole } from '../users/users.entity';
import { Roles } from '../auth/rules.decorator';

const addPropertySchema = z.object({
  number: z.number(),
  name: z.string(),
  city: z.string(),
  cp: z.number(),
  price: z.number().min(5),
  type: z.enum([type.HOME, type.APARTMENT]).optional(),
});

const UpdatePropertySchema = z.object({
  number: z.number().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  cp: z.number().optional(),
  price: z.number().min(5).optional(),
});
interface PropertyResponse {
  id: string;
  number: number;
  name: string;
  city: string;
  cp: number;
  price: number;
  type: string;
  isValide: boolean;
}

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}
  @Get(':id/')
  async getProperty(@Param('id') propertyId: string) {
    const property = await this.propertyService.getPropertyById(propertyId);
    return {
      id: property.id,
      number: property.number,
      name: property.name,
      city: property.city,
      cp: property.cp,
      price: property.price,
      type: property.type,
      isValide: property.isValide,
    };
  }

  @Post('add')
  async addProperty(
    @GetUser() user: UserResponse,
    @Body() property: z.infer<typeof addPropertySchema>,
  ): Promise<PropertyResponse> {
    const validProperty = addPropertySchema.parse(property);

    const newProperty = await this.propertyService.addProperty({
      number: validProperty.number,
      name: validProperty.name,
      city: validProperty.city,
      cp: validProperty.cp,
      price: validProperty.price,
      type: validProperty.type,
      ownerId: user.id,
    });

    return {
      id: newProperty.id,
      number: newProperty.number,
      name: newProperty.name,
      city: newProperty.city,
      cp: newProperty.cp,
      price: newProperty.price,
      type: newProperty.type,
      isValide: newProperty.isValide,
    };
  }

  @Roles(UserRole.HOST)
  @Patch(':id/')
  async updateProperty(
    @Param('id') propertyId: string,
    @GetUser() user: UserResponse,
    @Body() body: z.infer<typeof UpdatePropertySchema>,
  ): Promise<PropertyResponse> {
    const validProperty = UpdatePropertySchema.parse(body);
    /*if (!body.userId) {
      throw new UnprocessableEntityException('Please provide a user id.');
    }*/
    const property = await this.propertyService.updatePropertyById(
      propertyId,
      user.id,
      validProperty,
    );

    return {
      id: property.id,
      number: property.number,
      name: property.name,
      city: property.city,
      cp: property.cp,
      price: property.price,
      type: property.type,
      isValide: property.isValide,
    };
  }

  @Roles(UserRole.ADMIN)
  @Patch('validate/:id')
  async ValidateProperty(
    @Param('id') propertyId: string,
  ): Promise<PropertyResponse> {
    const property =
      await this.propertyService.ValidetePropertyByAdmin(propertyId);

    return {
      id: property.id,
      number: property.number,
      name: property.name,
      city: property.city,
      cp: property.cp,
      price: property.price,
      type: property.type,
      isValide: property.isValide,
    };
  }

  @Roles(UserRole.HOST)
  @Delete(':id/')
  async deleteProperty(
    @Param('id') propertyId: string,
  ): Promise<PropertyResponse> {
    const property = await this.propertyService.deletePropertyById(propertyId);
    return {
      id: property.id,
      number: property.number,
      name: property.name,
      city: property.city,
      cp: property.cp,
      price: property.price,
      type: property.type,
      isValide: property.isValide,
    };
  }
}
