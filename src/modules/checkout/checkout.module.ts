import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Transaction } from './domain/transaction.entity';
import { Customer } from './domain/customer.entity';
import { Delivery } from './domain/delivery.entity';
import { ITransactionRepository } from './domain/ports/transaction.repository.port';
import { PostgresTransactionRepository } from './infrastructure/persistence/postgres-transaction.repository';
import { IPaymentGateway } from './domain/ports/payment.gateway.port';
import { WompiPaymentGatewayAdapter } from './infrastructure/payment-gateways/wompi.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Customer, Delivery]), HttpModule],
  controllers: [],
  providers: [
    PostgresTransactionRepository,
    WompiPaymentGatewayAdapter,
    {
      provide: ITransactionRepository,
      useClass: PostgresTransactionRepository,
    },
  ],
  exports: [ITransactionRepository, IPaymentGateway],
})
export class CheckoutModule {}
