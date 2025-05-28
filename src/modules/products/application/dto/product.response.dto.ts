import { IsString, IsNumber, IsUUID, Min, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../domain/product.entity';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Identificador único del producto (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Camiseta de Algodón',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example: 'Camiseta de algodón suave, perfecta para el uso diario.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Precio del producto (en la unidad monetaria base, ej: pesos, no centavos)',
    example: 25.99,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Cantidad disponible en stock',
    example: 150,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'URL de la imagen principal del producto',
    example: 'https://example.com/images/camiseta_algodon.jpg',
  })
  @IsUrl()
  imageUrl: string;

  /**
   * Convierte un Product entity a ProductResponseDto.
   * @param entity Product a convertir.
   * @returns Una instancia de ProductResponseDto.
   */
  static fromEntity(entity: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = entity.price;
    dto.stock = entity.stock;
    dto.imageUrl = entity.imageUrl;
    return dto;
  }
}
