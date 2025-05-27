import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './domain/product.entity';
import { IProductRepository } from './domain/ports/product.repository.port';
import { PostgresProductRepository } from './infrastructure/persistence/postgres-product.repository';
import { ListAvailableProductsUseCase } from './application/use-cases/list-available-products.use-case';
import { ProductsController } from './infrastructure/controllers/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    PostgresProductRepository,

    {
      provide: IProductRepository,
      useClass: PostgresProductRepository,
    },
    ListAvailableProductsUseCase,
  ],
  exports: [IProductRepository, ListAvailableProductsUseCase],
})
export class ProductsModule {}
