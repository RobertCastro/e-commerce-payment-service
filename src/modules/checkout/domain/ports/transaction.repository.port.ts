import { Transaction } from '../transaction.entity';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  findByWompiId(wompiId: string): Promise<Transaction | null>;
}

export const ITransactionRepository = Symbol('ITransactionRepository');
