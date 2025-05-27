import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { InitiateCheckoutUseCase } from '../../application/use-cases/initiate-checkout.use-case';
import { InitiateCheckoutDto } from '../../application/dto/initiate-checkout.dto';
import { Transaction } from '../../domain/transaction.entity';

@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly initiateCheckoutUseCase: InitiateCheckoutUseCase) {}

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
}
