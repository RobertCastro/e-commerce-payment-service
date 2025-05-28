import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class CheckoutItemDto {
  @ApiProperty({
    description: 'ID del producto (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

class CustomerDto {
  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+573001234567',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

class DeliveryDto {
  @ApiProperty({
    description: 'Dirección de entrega completa',
    example: 'Calle Falsa 123, Apto 101',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Ciudad de entrega', example: 'Bogotá D.C.' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'País de entrega (código ISO 2 letras)', example: 'CO' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class InitiateCheckoutDto {
  @ApiProperty({
    description: 'Lista de items en el carrito',
    type: () => [CheckoutItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({
    description: 'Información del cliente',
    type: () => CustomerDto,
  })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({
    description: 'Información de la dirección de entrega',
    type: () => DeliveryDto,
  })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
