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
import { TransactionStatus, TransactionItem, Transaction } from '../../domain/transaction.entity';

class TransactionItemDetailDto implements TransactionItem {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class TransactionDetailDto {
  @IsUUID()
  id: string;

  @IsString()
  status: TransactionStatus;

  @Type(() => Number)
  @IsNumber()
  totalAmount: number;

  @IsString()
  currency: string;

  @IsString()
  reference: string;

  @IsString()
  @IsOptional()
  wompiTransactionId?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

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
