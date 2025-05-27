import { Customer } from '../customer.entity';
export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
}
export const ICustomerRepository = Symbol('ICustomerRepository');
