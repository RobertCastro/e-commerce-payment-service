export class Product {
  readonly id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;

  constructor(
    id: string,
    name: string,
    description: string,
    price: number,
    stock: number,
    imageUrl: string,
  ) {
    if (!id) throw new Error('El ID del producto no puede estar vacío');
    if (!name) throw new Error('El nombre del producto no puede estar vacío');
    if (price < 0) throw new Error('El precio del producto no puede ser negativo');
    if (stock < 0) throw new Error('El stock del producto no puede ser negativo');

    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.imageUrl = imageUrl;
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser positiva.');
    }
    if (this.stock < quantity) {
      throw new Error('Stock insuficiente.');
    }
    this.stock -= quantity;
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser positiva.');
    }
    this.stock += quantity;
  }
}
