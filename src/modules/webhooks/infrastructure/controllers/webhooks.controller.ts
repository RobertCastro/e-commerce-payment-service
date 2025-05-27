import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HandleWompiEventUseCase } from '../../application/use-cases/handle-wompi-event.use-case';
import { WompiEventDto } from '../../application/dto/wompi-event.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly handleEventUseCase: HandleWompiEventUseCase) {}

  @Post('wompi')
  async handleWompiWebhook(@Body() payload: WompiEventDto) {
    this.logger.log('Payload de Webhook de Wompi recibido:', JSON.stringify(payload, null, 2));

    if (!payload || !payload.data || !payload.data.transaction) {
      this.logger.error('Estructura de payload de webhook de Wompi inválida.');
      throw new HttpException('Payload inválido', HttpStatus.BAD_REQUEST);
    }

    const result = await this.handleEventUseCase.execute(payload);

    if (result.ok) {
      return { received: true };
    } else {
      this.logger.error(`Error al procesar el webhook: ${result.error.message}`);
      throw new HttpException('Error al procesar el webhook', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
