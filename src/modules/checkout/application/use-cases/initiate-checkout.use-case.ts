import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IProductRepository } from '../../../products/domain/ports/product.repository.port';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { Result, success, failure } from '../../../../core/shared/result';
import { BaseError } from '../../../../core/errors/base.error';
import { InitiateCheckoutDto } from '../dto/initiate-checkout.dto';
import { Transaction, TransactionItem } from '../../domain/transaction.entity';
import { Customer } from '../../domain/customer.entity';
import { Delivery } from '../../domain/delivery.entity';
import { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { IDeliveryRepository } from '../../domain/ports/delivery.repository.port';
// import { Product } from 'src/modules/products/domain/product.entity';

export class CheckoutError extends BaseError {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

@Injectable()
export class InitiateCheckoutUseCase {
  private readonly logger = new Logger(InitiateCheckoutUseCase.name);
  private readonly SHIPPING_COST = 500000;
  private readonly BASE_FEE = 100000;

  constructor(
    @Inject(IProductRepository) private readonly productRepo: IProductRepository,
    @Inject(ITransactionRepository) private readonly transactionRepo: ITransactionRepository,
    @Inject(ICustomerRepository) private readonly customerRepo: ICustomerRepository,
    @Inject(IDeliveryRepository) private readonly deliveryRepo: IDeliveryRepository,
  ) {}

  async execute(dto: InitiateCheckoutDto): Promise<Result<Transaction, CheckoutError>> {
    this.logger.log(`Iniciando checkout para el cliente: ${dto.customer.email}`);

    try {
      // 1. Obtener productos y verificar stock
      const transactionItems: TransactionItem[] = [];
      let subTotal = 0;

      for (const item of dto.items) {
        const product = await this.productRepo.findById(item.productId);

        if (!product) {
          return failure(
            new CheckoutError(
              'PRODUCT_NOT_FOUND',
              `Producto con ID ${item.productId} no encontrado.`,
            ),
          );
        }
        if (product.stock < item.quantity) {
          return failure(
            new CheckoutError(
              'INSUFFICIENT_STOCK',
              `Stock insuficiente para el producto ${product.name}.`,
            ),
          );
        }

        transactionItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price * 100,
        });
        subTotal += product.price * 100 * item.quantity;
      }

      // 2. Crear o buscar Customer y Delivery
      // (Por ahora se crean nuevos)
      const customer = new Customer(
        uuidv4(),
        dto.customer.email,
        dto.customer.fullName,
        dto.customer.phoneNumber,
      );
      await this.customerRepo.save(customer);

      const delivery = new Delivery(
        uuidv4(),
        dto.delivery.address,
        dto.delivery.city,
        dto.delivery.country,
      );
      await this.deliveryRepo.save(delivery);

      // 3. Crear la transacción
      const transaction = new Transaction();
      transaction.id = uuidv4();
      transaction.customerId = customer.id;
      transaction.deliveryId = delivery.id;
      transaction.items = transactionItems;
      transaction.shippingCost = this.SHIPPING_COST;
      transaction.baseFee = this.BASE_FEE;
      transaction.status = 'PENDING';
      transaction.createdAt = new Date();
      transaction.updatedAt = new Date();
      transaction.totalAmount = subTotal + this.SHIPPING_COST + this.BASE_FEE;

      // 4. Guardar la transacción
      await this.transactionRepo.save(transaction);

      this.logger.log(`Transacción ${transaction.id} iniciada exitosamente.`);
      // 5. Respuesta de la transacción creada
      return success(transaction);
    } catch (error) {
      this.logger.error(`Error iniciando checkout: ${error.message}`, error.stack);
      return failure(
        new CheckoutError('INTERNAL_ERROR', `Ocurrió un error inesperado: ${error.message}`),
      );
    }
  }
}
