import { Delivery } from '../delivery.entity';
export interface IDeliveryRepository {
  save(delivery: Delivery): Promise<void>;
}
export const IDeliveryRepository = Symbol('IDeliveryRepository');
