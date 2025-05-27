import { Controller, Post, Body, Logger, Headers } from '@nestjs/common';
// import { Request } from 'express';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  @Post('wompi')
  async handleWompiWebhook(
    @Body() payload: any,
    @Headers() headers: any,
    // @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log('Webhook de Wompi recibido!');
    this.logger.log('Headers:', JSON.stringify(headers, null, 2));
    this.logger.log('Payload:', JSON.stringify(payload, null, 2));

    // TODO verificar la firma

    return { received: true };
  }
}
