import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';
import { InitiateCheckoutUseCase } from '../../application/use-cases/initiate-checkout.use-case';
import { InitiateCheckoutDto } from '../../application/dto/initiate-checkout.dto';
import { Transaction } from '../../domain/transaction.entity';
import { ProcessPaymentDto } from '../../application/dto/process-payment.dto';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.use-case';
import { TransactionDetailDto } from '../../application/dto/transaction-detail.dto';
@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(
    private readonly initiateCheckoutUseCase: InitiateCheckoutUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  async initiate(@Body() initiateDto: InitiateCheckoutDto): Promise<Transaction> {
    this.logger.log(`Solicitud recibida para iniciar checkout:`, initiateDto);

    const result = await this.initiateCheckoutUseCase.execute(initiateDto);

    if (result.ok) {
      return result.value;
    } else {
      const error = result.error;
      this.logger.error(`La iniciación del checkout falló: ${error.message}`);

      let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      if (error.code === 'PRODUCT_NOT_FOUND' || error.code === 'INSUFFICIENT_STOCK') {
        httpStatus = HttpStatus.BAD_REQUEST;
      }

      throw new HttpException(
        {
          statusCode: httpStatus,
          message: error.message,
          errorCode: error.code,
        },
        httpStatus,
      );
    }
  }

  @Post(':transactionId/process') // POST /checkout/{ID}/process
  @HttpCode(HttpStatus.OK)
  async process(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body() processDto: ProcessPaymentDto,
  ): Promise<Transaction> {
    this.logger.log(`Solicitud recibida para procesar el pago de la transacción: ${transactionId}`);

    const result = await this.processPaymentUseCase.execute(transactionId, processDto);

    if (result.ok) {
      return result.value;
    } else {
      const error = result.error;
      this.logger.error(`El procesamiento del pago falló: ${error.message}`);
      let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      if (error.code === 'TRANSACTION_NOT_FOUND') httpStatus = HttpStatus.NOT_FOUND;
      if (error.code === 'INVALID_STATUS' || error.code === 'GATEWAY_ERROR')
        httpStatus = HttpStatus.BAD_REQUEST;

      throw new HttpException(
        { statusCode: httpStatus, message: error.message, errorCode: error.code },
        httpStatus,
      );
    }
  }

  @Get(':transactionId/status') // GET /checkout/{ID}/status
  async getStatus(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<TransactionDetailDto> {
    this.logger.log(`Solicitud recibida para el estado de la transacción: ${transactionId}`);

    const result = await this.getTransactionStatusUseCase.execute(transactionId);

    if (result.ok) {
      return result.value;
    } else {
      const error = result.error;
      this.logger.error(`Error obteniendo el estado de la transacción: ${error.message}`);
      let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      if (error.code === 'TRANSACTION_NOT_FOUND') {
        httpStatus = HttpStatus.NOT_FOUND;
      }
      throw new HttpException(
        { statusCode: httpStatus, message: error.message, errorCode: error.code },
        httpStatus,
      );
    }
  }
}
