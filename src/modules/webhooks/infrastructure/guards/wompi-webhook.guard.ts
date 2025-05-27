// src/modules/webhooks/infrastructure/guards/wompi-webhook.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class WompiWebhookGuard implements CanActivate {
  private readonly logger = new Logger(WompiWebhookGuard.name);
  private readonly wompiEventsKey: string;
  // TODO Verificar cabecera
  private readonly WOMPI_SIGNATURE_HEADER = 'x-wompi-signature-v1';

  constructor(private readonly configService: ConfigService) {
    const wompiEventsKey = this.configService.get<string>('WOMPI_EVENTS_KEY');
    if (!wompiEventsKey) {
      throw new Error('WOMPI_EVENTS_KEY is not configured!');
    }
    this.wompiEventsKey = wompiEventsKey;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>();

    const rawBody = request.rawBody;
    const wompiSignature = request.headers[this.WOMPI_SIGNATURE_HEADER];

    if (!rawBody) {
      this.logger.warn('Solicitud de webhook sin raw body.');
      throw new ForbiddenException(
        'Falta el cuerpo crudo (raw body) para la verificación de la firma.',
      );
    }

    if (!wompiSignature) {
      this.logger.warn(
        `Solicitud de webhook sin la cabecera de firma: ${this.WOMPI_SIGNATURE_HEADER}`,
      );
      throw new ForbiddenException('Falta la firma de Wompi.');
    }

    // Calculamos firma.
    const calculatedSignature = crypto
      .createHmac('sha256', this.wompiEventsKey)
      .update(rawBody)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(wompiSignature as string, 'hex'),
    );

    if (!isValid) {
      this.logger.warn(
        `Firma de Wompi inválida. Calculada: ${calculatedSignature}, Recibida: ${wompiSignature}`,
      );
      throw new ForbiddenException('Firma de Wompi inválida.');
    }

    this.logger.log('Firma de Wompi validada con éxito.');
    return true;
  }
}
