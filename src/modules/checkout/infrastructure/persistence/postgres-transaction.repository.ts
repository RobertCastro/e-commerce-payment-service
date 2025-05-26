import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../domain/transaction.entity';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';

@Injectable()
export class PostgresTransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOneBy({ id });
  }

  async save(transaction: Transaction): Promise<void> {
    await this.transactionRepository.save(transaction);
  }

  async update(transaction: Transaction): Promise<void> {
    await this.transactionRepository.save(transaction);
  }

  async findByWompiId(wompiId: string): Promise<Transaction | null> {
    return this.transactionRepository.findOneBy({ wompiId });
  }
}
