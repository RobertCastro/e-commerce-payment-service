import { Module } from '@nestjs/common';
import { WebhooksController } from './infrastructure/controllers/webhooks.controller';
import { CheckoutModule } from '../checkout/checkout.module';

@Module({
  imports: [CheckoutModule],
  controllers: [WebhooksController],
  providers: [
    // TODO Guard y UseCase
  ],
})
export class WebhooksModule {}
