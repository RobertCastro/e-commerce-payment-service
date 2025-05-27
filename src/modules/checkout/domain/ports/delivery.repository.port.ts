import { Delivery } from '../delivery.entity';

export interface IDeliveryRepository {
  save(delivery: Delivery): Promise<void>;
  findById(id: string): Promise<Delivery | null>;
}

export const IDeliveryRepository = Symbol('IDeliveryRepository');
