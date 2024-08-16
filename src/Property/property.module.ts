import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    forwardRef(() => UsersModule),],
  providers: [PropertyService],
  exports: [PropertyService],
  controllers: [PropertyController],
})
export class PropertyModule {}
