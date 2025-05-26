export class Delivery {
  readonly id: string;
  address: string;
  city: string;
  country: string;

  constructor(id: string, address: string, city: string, country: string) {
    this.id = id;
    this.address = address;
    this.city = city;
    this.country = country;
  }
}
