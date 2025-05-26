import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './domain/transaction.entity';
import { Customer } from './domain/customer.entity';
import { Delivery } from './domain/delivery.entity';
import { ITransactionRepository } from './domain/ports/transaction.repository.port';
import { PostgresTransactionRepository } from './infrastructure/persistence/postgres-transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Customer, Delivery])],
  controllers: [],
  providers: [
    PostgresTransactionRepository,
    {
      provide: ITransactionRepository,
      useClass: PostgresTransactionRepository,
    },
  ],
  exports: [ITransactionRepository],
})
export class CheckoutModule {}
