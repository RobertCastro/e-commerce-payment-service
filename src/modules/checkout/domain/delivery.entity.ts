import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column('text')
  address: string;

  @Column('text')
  city: string;

  @Column('text')
  country: string;

  constructor(id: string, address: string, city: string, country: string) {
    this.id = id;
    this.address = address;
    this.city = city;
    this.country = country;
  }
}
