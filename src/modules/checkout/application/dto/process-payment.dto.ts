import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class PaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  type: 'CARD' | 'NEQUI' | 'PSE';

  @IsString()
  @IsOptional() // Solo CARD
  token?: string;

  @IsNumber()
  @IsOptional() // CARD
  installments?: number;

  @IsString()
  @IsOptional() // NEQUI
  phone_number?: string;
}

export class ProcessPaymentDto {
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;
}
