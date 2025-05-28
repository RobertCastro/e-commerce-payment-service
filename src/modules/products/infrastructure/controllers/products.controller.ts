import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListAvailableProductsUseCase } from '../../application/use-cases/list-available-products.use-case';
import { ProductResponseDto } from '../../application/dto/product.response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly listProductsUseCase: ListAvailableProductsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente.',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al intentar listar los productos.',
  })
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
