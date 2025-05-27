import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { Result, success, failure } from '../../../../core/shared/result';
import { BaseError } from '../../../../core/errors/base.error';
import { TransactionDetailDto } from '../dto/transaction-detail.dto';

export class GetTransactionStatusError extends BaseError {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

@Injectable()
export class GetTransactionStatusUseCase {
  private readonly logger = new Logger(GetTransactionStatusUseCase.name);

  constructor(
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(
    transactionId: string,
  ): Promise<Result<TransactionDetailDto, GetTransactionStatusError>> {
    this.logger.log(`Obteniendo el estado para la transacción: ${transactionId}`);

    try {
      const transaction = await this.transactionRepo.findById(transactionId);

      if (!transaction) {
        return failure(
          new GetTransactionStatusError(
            'TRANSACTION_NOT_FOUND',
            `Transacción ${transactionId} no encontrada.`,
          ),
        );
      }

      // Mapeamos la entidad a nuestro DTO de respuesta
      const transactionDto = TransactionDetailDto.fromEntity(transaction);
      return success(transactionDto);
    } catch (error) {
      this.logger.error(
        `Error obteniendo el estado de la transacción: ${error.message}`,
        error.stack,
      );
      return failure(
        new GetTransactionStatusError(
          'INTERNAL_ERROR',
          `Ocurrió un error inesperado: ${error.message}`,
        ),
      );
    }
  }
}
