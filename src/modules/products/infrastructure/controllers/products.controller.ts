import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ListAvailableProductsUseCase } from '../../application/use-cases/list-available-products.use-case';
import { ProductResponseDto } from '../../application/dto/product.response.dto';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly listProductsUseCase: ListAvailableProductsUseCase) {}

  @Get()
  async findAll(): Promise<ProductResponseDto[]> {
    this.logger.log('Recibido request para listar productos disponibles');

    const result = await this.listProductsUseCase.execute();

    if (!result.ok) {
      this.logger.error(`Error al listar productos: ${result.error.message}`, result.error.stack);
      throw new HttpException(
        `Error al listar productos: ${result.error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.value;
  }
}
