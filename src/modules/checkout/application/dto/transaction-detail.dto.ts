import {
  IsString,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction, TransactionItem } from '../../domain/transaction.entity';

class TransactionItemDetailDto implements TransactionItem {
  @ApiProperty({
    description: 'ID del producto en el item',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Cantidad del producto en el item', example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto en centavos al momento de la compra',
    example: 50000,
  })
  @IsNumber()
  unitPrice: number;
}

export class TransactionDetailDto {
  @ApiProperty({
    description: 'ID único de la transacción (UUID)',
    example: 'b6d533e2-6add-4fba-89b5-a258c1920eb0',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Estado actual de la transacción',
    type: String,
    example: 'PENDING',
  })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Monto total de la transacción en centavos', example: 605000 })
  @Type(() => Number)
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Moneda de la transacción', example: 'COP' })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Referencia interna de la transacción (usualmente igual al ID)',
    example: 'b6d533e2-6add-4fba-89b5-a258c1920eb0',
  })
  @IsString()
  reference: string;

  @ApiPropertyOptional({
    description: 'ID de la transacción asignado por Wompi (si existe)',
    example: 'wompi_tx_12345',
  })
  @IsString()
  @IsOptional()
  wompiTransactionId?: string;

  @ApiProperty({
    description: 'Fecha y hora de creación de la transacción',
    example: '2025-05-27T23:13:20.821Z',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización de la transacción',
    example: '2025-05-27T23:13:20.821Z',
  })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({
    description: 'Lista de items incluidos en la transacción',
    type: () => [TransactionItemDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDetailDto)
  items: TransactionItemDetailDto[];

  static fromEntity(entity: Transaction): TransactionDetailDto {
    const dto = new TransactionDetailDto();
    dto.id = entity.id;
    dto.status = entity.status;
    dto.totalAmount = entity.totalAmount;
    dto.currency = 'COP';
    dto.reference = entity.id;
    dto.wompiTransactionId = entity.wompiTransactionId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.items = entity.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));
    return dto;
  }
}
