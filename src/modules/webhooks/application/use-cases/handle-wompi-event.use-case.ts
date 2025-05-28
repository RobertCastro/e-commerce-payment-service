import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITransactionRepository } from '../../../checkout/domain/ports/transaction.repository.port';
import { IProductRepository } from '../../../products/domain/ports/product.repository.port';
import { Result, success, failure } from '../../../../core/shared/result';
import { BaseError } from '../../../../core/errors/base.error';
import { WompiEventDto } from '../dto/wompi-event.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Transaction } from '../../../checkout/domain/transaction.entity';

export class WebhookError extends BaseError {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

@Injectable()
export class HandleWompiEventUseCase {
  private readonly logger = new Logger(HandleWompiEventUseCase.name);

  constructor(
    @Inject(ITransactionRepository) private readonly transactionRepo: ITransactionRepository,
    @Inject(IProductRepository) private readonly productRepo: IProductRepository,
  ) {}

  async execute(payload: WompiEventDto): Promise<Result<void, WebhookError>> {
    const { reference, status: wompiStatus, id: wompiId } = payload.data.transaction;
    this.logger.log(
      `Procesando evento de Wompi para la referencia ${reference}, estado ${wompiStatus}`,
    );

    try {
      // 1. Buscar la transacción
      const transaction = await this.transactionRepo.findById(reference);

      if (!transaction) {
        this.logger.warn(
          `Transacción con referencia ${reference} no encontrada. Ignorando webhook.`,
        );
        return success(undefined);
      }

      // 2. Si la transacción ya está en un estado final
      if (
        transaction.status === 'APPROVED' ||
        transaction.status === 'DECLINED' ||
        transaction.status === 'ERROR'
      ) {
        this.logger.log(
          `Transacción ${reference} ya está en un estado final (${transaction.status}). Ignorando.`,
        );
        return success(undefined);
      }

      // 3. Actualizar el estado según Wompi.
      let updateStock = false;
      switch (wompiStatus) {
        case 'APPROVED':
          transaction.status = 'APPROVED';
          transaction.wompiTransactionId = wompiId;
          updateStock = true;
          break;
        case 'DECLINED':
          transaction.status = 'DECLINED';
          transaction.wompiTransactionId = wompiId;
          break;
        case 'ERROR':
          transaction.status = 'ERROR';
          transaction.wompiTransactionId = wompiId;
          break;
        case 'VOIDED':
          transaction.status = 'DECLINED';
          transaction.wompiTransactionId = wompiId;
          break;
        default:
          this.logger.log(`Ignorando estado ${wompiStatus}`);
          return success(undefined);
      }

      transaction.updatedAt = new Date();
      await this.transactionRepo.update(transaction);
      this.logger.log(`Transacción ${reference} actualizada a ${transaction.status}.`);

      // 4. Actualizar Stock si fue APROBADO
      if (updateStock) {
        this.logger.log(`Actualizando stock para la transacción ${reference}...`);
        for (const item of transaction.items) {
          const product = await this.productRepo.findById(item.productId);
          if (product) {
            product.stock -= item.quantity;
            await this.productRepo.update(product);
            this.logger.log(`Stock del producto ${item.productId} actualizado a ${product.stock}.`);
          } else {
            this.logger.error(
              `Producto ${item.productId} no encontrado durante la actualización de stock!`,
            );
            // TODO revisar consistencia.
          }
        }
      }

      return success(undefined);
    } catch (error) {
      this.logger.error(`Error al manejar el webhook de Wompi: ${error.message}`, error.stack);
      return failure(
        new WebhookError('INTERNAL_ERROR', `Error al procesar el webhook: ${error.message}`),
      );
    }
  }
}
