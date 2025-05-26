export class Customer {
  readonly id: string;
  email: string;
  fullName: string;
  phoneNumber: string;

  constructor(id: string, email: string, fullName: string, phoneNumber: string) {
    // TODO validaciones
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.phoneNumber = phoneNumber;
  }
}
