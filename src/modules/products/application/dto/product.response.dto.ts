import { IsString, IsNumber, IsUUID, Min, IsUrl, IsNotEmpty } from 'class-validator';
import { Product } from '../../domain/product.entity';

export class ProductResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

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
