import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../domain/customer.entity';

@Injectable()
export class PostgresCustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    return this.customerRepository.findOneBy({ id });
  }

  async save(customer: Customer): Promise<void> {
    await this.customerRepository.save(customer);
  }

  async update(customer: Customer): Promise<void> {
    await this.customerRepository.save(customer);
  }
}
