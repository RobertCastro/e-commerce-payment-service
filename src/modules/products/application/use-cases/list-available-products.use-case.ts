import { Injectable, Inject, Logger } from '@nestjs/common';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { ProductResponseDto } from '../dto/product.response.dto';
import { Result, success, failure } from '../../../../core/shared/result';
import { BaseError } from '../../../../core/errors/base.error';
import { Product } from '../../domain/product.entity';

export class ListProductsError extends BaseError {
  readonly code = 'LIST_PRODUCTS_ERROR';
  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class ListAvailableProductsUseCase {
  private readonly logger = new Logger(ListAvailableProductsUseCase.name);

  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<Result<ProductResponseDto[], ListProductsError>> {
    this.logger.log('Ejecutando ListAvailableProductsUseCase...');

    try {
      const products: Product[] = await this.productRepository.findAll();

      const productDtos: ProductResponseDto[] = products.map(ProductResponseDto.fromEntity);

      this.logger.log(`Se encontraron ${productDtos.length} productos.`);
      return success(productDtos);
    } catch (error) {
      this.logger.error('Error al listar productos', error);
      return failure(new ListProductsError(`Error al listar productos: ${error.message}`));
    }
  }
}
