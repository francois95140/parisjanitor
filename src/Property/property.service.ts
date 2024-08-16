import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Property, type } from './property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.sercice';

interface NewPropertyDto {
  number: number;
  name: string;
  city: string;
  cp: number;
  price: number;
  type: type;
  ownerId: string;
}
interface UpdatePropertyDto {
  number?: number;
  name?: string;
  city?: string;
  cp?: number;
  price?: number;
}
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async addProperty(property: NewPropertyDto): Promise<Property | null> {
    const existingProperty = await this.propertyRepository.findOneBy({
      name: property.name,
    });

    const owner = await this.usersService.findOneById(property.ownerId);

    if (existingProperty) {
      throw new ConflictException('An Property with this name already exists');
    }

    const result = await this.propertyRepository.insert({
      name: property.name,
      number: property.number,
      cp: property.cp,
      price: property.price,
      type: property.type,
      city: property.city,
      owner: owner,
    });
    const propertyId = result.generatedMaps[0].id;

    return this.propertyRepository.findOneBy({ id: propertyId });
  }

  async getPropertyById(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async deletePropertyById(id: string): Promise<Property> {
    const property = await this.getPropertyById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    await this.propertyRepository.delete(property.id);

    return property;
  }

  async updatePropertyById(
    id: string,
    dto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.getPropertyById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (dto.number) {
      property.number = dto.number;
    }

    if (dto.name) {
      property.name = dto.name;
    }

    if (dto.city) {
      property.city = dto.city;
    }

    if (dto.cp) {
      property.cp = dto.cp;
    }

    if (dto.price) {
      property.price = dto.price;
    }

    await this.propertyRepository.save(property);

    return property;
  }

  async ValidetePropertyByAdmin(id: string) {
    const property = await this.getPropertyById(id);
    property.isValide = true;
    const prop = await this.propertyRepository.save(property);
    await this.usersService.makeUserHost(prop.owner.id);

    return property;
  }
}
