import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';

const PaymentMethodTypesArray = ['CARD', 'NEQUI', 'PSE'] as const;

class PaymentMethodDto {
  @ApiProperty({
    description: 'Tipo de método de pago',
    enum: PaymentMethodTypesArray,
    example: 'CARD',
  })
  @IsEnum(PaymentMethodTypesArray)
  @IsString()
  @IsNotEmpty()
  type: 'CARD' | 'NEQUI' | 'PSE';

  @ApiPropertyOptional({
    description: 'Token de la tarjeta (solo para tipo CARD, obtenido de Wompi)',
    example: 'tok_test_12345_ABCDEFG',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    description: 'Número de cuotas (solo para tipo CARD)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  installments?: number;

  @ApiPropertyOptional({
    description: 'Número de teléfono asociado a Nequi (solo para tipo NEQUI)',
    example: '3001234567',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Detalles del método de pago a utilizar',
    type: () => PaymentMethodDto,
  })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;
}
