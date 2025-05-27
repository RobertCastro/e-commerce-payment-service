import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ProductsModule } from '../products/products.module';

// Entidades de dominio
import { Transaction } from './domain/transaction.entity';
import { Customer } from './domain/customer.entity';
import { Delivery } from './domain/delivery.entity';

// Puertos de dominio
import { ITransactionRepository } from './domain/ports/transaction.repository.port';
import { ICustomerRepository } from './domain/ports/customer.repository.port';
import { IDeliveryRepository } from './domain/ports/delivery.repository.port';
import { IPaymentGateway } from './domain/ports/payment.gateway.port';

// Adaptadores de persistencia
import { PostgresTransactionRepository } from './infrastructure/persistence/postgres-transaction.repository';
import { PostgresCustomerRepository } from './infrastructure/persistence/postgres-customer.repository';
import { PostgresDeliveryRepository } from './infrastructure/persistence/postgres-delivery.repository';

// Adaptador de gateway de pago
import { WompiPaymentGatewayAdapter } from './infrastructure/payment-gateways/wompi.adapter';

// Casos de uso de aplicación
import { InitiateCheckoutUseCase } from './application/use-cases/initiate-checkout.use-case';
import { GetTransactionStatusUseCase } from './application/use-cases/get-transaction-status.use-case';

// controllers
import { CheckoutController } from './infrastructure/controllers/checkout.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Transaction, Customer, Delivery]),
    ProductsModule,
  ],
  controllers: [CheckoutController],
  providers: [
    PostgresTransactionRepository,
    PostgresCustomerRepository,
    PostgresDeliveryRepository,
    GetTransactionStatusUseCase,

    {
      provide: ITransactionRepository,
      useClass: PostgresTransactionRepository,
    },
    {
      provide: ICustomerRepository,
      useClass: PostgresCustomerRepository,
    },
    {
      provide: IDeliveryRepository,
      useClass: PostgresDeliveryRepository,
    },

    WompiPaymentGatewayAdapter,

    {
      provide: IPaymentGateway,
      useClass: WompiPaymentGatewayAdapter,
    },

    InitiateCheckoutUseCase,
  ],
  exports: [
    ITransactionRepository,
    IPaymentGateway,
    InitiateCheckoutUseCase,
    GetTransactionStatusUseCase,
  ],
})
export class CheckoutModule {}
