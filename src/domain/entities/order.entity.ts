import { OrderStatus } from '../enums/order-status';

export class Order {
  private readonly _id: string;
  private readonly _bookId: string;
  private _quantity: number;
  private _totalPrice: number;
  private _status: OrderStatus;
  private readonly _currency: string;
  private readonly _createdAt: Date;

  private constructor(params: {
    id: string;
    bookId: string;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    currency: string;
    createdAt: Date;
  }) {
    this._id = params.id;
    this._bookId = params.bookId;
    this._quantity = params.quantity;
    this._totalPrice = params.totalPrice;
    this._status = params.status;
    this._currency = params.currency;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get bookId(): string {
    return this._bookId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get currency(): string {
    return this._currency;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set quantity(value: number) {
    this._quantity = value;
  }

  set totalPrice(value: number) {
    this._totalPrice = value;
  }

  set status(value: OrderStatus) {
    this._status = value;
  }

  static create(params: {
    id: string;
    bookId: string;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    currency: string;
  }): Order {
    return new Order({ ...params, createdAt: new Date() });
  }

  static restore(params: {
    id: string;
    bookId: string;
    quantity: number;
    totalPrice: number;
    currency: string;
    status: OrderStatus;
    createdAt: Date;
  }): Order {
    return new Order(params);
  }
}
