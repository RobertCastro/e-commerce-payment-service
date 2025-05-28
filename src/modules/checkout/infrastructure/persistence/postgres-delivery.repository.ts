import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../../domain/delivery.entity';
import { IDeliveryRepository } from '../../domain/ports/delivery.repository.port';

@Injectable()
export class PostgresDeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
  ) {}

  async save(delivery: Delivery): Promise<void> {
    await this.deliveryRepository.save(delivery);
  }

  async findById(id: string): Promise<Delivery | null> {
    return this.deliveryRepository.findOneBy({ id });
  }
}
