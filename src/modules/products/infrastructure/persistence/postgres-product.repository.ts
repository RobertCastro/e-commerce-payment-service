import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';
import { IProductRepository } from '../../domain/ports/product.repository.port';

@Injectable()
export class PostgresProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findOneBy({ id });
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async save(product: Product): Promise<void> {
    await this.productRepository.save(product);
  }

  async update(product: Product): Promise<void> {
    await this.productRepository.save(product);
  }
}
