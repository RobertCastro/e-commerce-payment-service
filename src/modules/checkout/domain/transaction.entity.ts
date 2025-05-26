export type TransactionStatus =
  | 'PENDING' // Iniciada, esperando pago
  | 'PROCESSING' // Pago en proceso
  | 'APPROVED' // Pago aceptado
  | 'DECLINED' // Pago rechazado
  | 'ERROR'; // Hubo un error

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class Transaction {
  readonly id: string;
  customerId: string;
  deliveryId: string;
  items: TransactionItem[];
  totalAmount: number;
  shippingCost: number;
  baseFee: number;
  status: TransactionStatus;
  wompiTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    customerId: string,
    deliveryId: string,
    items: TransactionItem[],
    shippingCost: number,
    baseFee: number,
  ) {
    if (!items || items.length === 0) {
      throw new Error('La lista de items no puede estar vacía');
    }

    this.id = id;
    this.customerId = customerId;
    this.deliveryId = deliveryId;
    this.items = items;
    this.shippingCost = shippingCost;
    this.baseFee = baseFee;
    // Calculamos el total
    this.totalAmount =
      items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) + shippingCost + baseFee;
    this.status = 'PENDING'; // Iniciamos con pendiente.
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  approve(wompiId: string): void {
    if (this.status === 'PENDING' || this.status === 'PROCESSING') {
      this.status = 'APPROVED';
      this.wompiTransactionId = wompiId;
      this.updatedAt = new Date();
    } else {
      console.warn(`No se puede aprobar la transacción ${this.id} en estado ${this.status}`);
    }
  }

  decline(wompiId?: string): void {
    if (this.status === 'PENDING' || this.status === 'PROCESSING') {
      this.status = 'DECLINED';
      if (wompiId) this.wompiTransactionId = wompiId;
      this.updatedAt = new Date();
    } else {
      console.warn(`No se puede rechazar la transacción ${this.id} en estado ${this.status}`);
    }
  }

  markAsProcessing(wompiId: string): void {
    if (this.status === 'PENDING') {
      this.status = 'PROCESSING';
      this.wompiTransactionId = wompiId;
      this.updatedAt = new Date();
    } else {
      console.warn(
        `No se puede marcar como en proceso la transacción ${this.id} en estado ${this.status}`,
      );
    }
  }
}
