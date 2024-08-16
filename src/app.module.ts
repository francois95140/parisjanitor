import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './config/datasource.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyModule } from './Property/property.module';
import { BookingsModule } from './Booking/bookings.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    PropertyModule,
    BookingsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [AppService, AuthService],
})
export class AppModule {}
