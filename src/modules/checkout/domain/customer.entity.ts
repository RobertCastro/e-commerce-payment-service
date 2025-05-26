import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  constructor(id: string, email: string, fullName: string, phoneNumber: string) {
    // TODO validaciones
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.phoneNumber = phoneNumber;
  }
}
