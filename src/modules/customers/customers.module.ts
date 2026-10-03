import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpModule } from '../otp/otp.module';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { JwtCustomerAccessStrategy } from './strategies/jwt-customer-access.strategy';
import { JwtCustomerRefreshStrategy } from './strategies/jwt-customer-refresh.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
    PassportModule,
    JwtModule.register({}),
    OtpModule,
  ],
  controllers: [CustomerAuthController, CustomersController],
  providers: [CustomersService, CustomerAuthService, JwtCustomerAccessStrategy, JwtCustomerRefreshStrategy],
  exports: [CustomersService],
})
export class CustomersModule {}
