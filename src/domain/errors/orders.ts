export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OrdersNotFoundError extends DomainError {
  readonly code = 'ORDERS_NOT_FOUND';

  constructor() {
    super('No orders found in the database');
  }
}

export class InvalidOrderDataError extends DomainError {
  readonly code = 'INVALID_ORDER_DATA';

  constructor(field: string, reason: string) {
    super(`Order with the data field ${field} is incorrect: ${reason}`);
  }
}

export class BookNotFoundError extends DomainError {
  readonly code = 'BOOK_NOT_FOUND';

  constructor(bookId: string) {
    super(`Book with ID ${bookId} was not found in Books Service`);
  }
}

export class InvalidBookDataError extends DomainError {
  readonly code = 'INVALID_BOOK_DATA';

  constructor(field: string, reason: string) {
    super(`Book with the data field ${field} is incorrect: ${reason}`);
  }
}

export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY';

  constructor(quantity: number) {
    super(`Order quantity must be greater than 0, received ${quantity}`);
  }
}

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(available: number, requested: number) {
    super(
      `Order quantity ${requested} exceeds available stock ${available}, not possible to fulfill`,
    );
  }
}

export class BooksServiceUnavailableError extends DomainError {
  readonly code = 'BOOKS_SERVICE_UNAVAILABLE';

  constructor() {
    super('Books Service is currently unavailable');
  }
}

export class BooksServiceTimeoutError extends DomainError {
  readonly code = 'BOOKS_SERVICE_TIMEOUT';

  constructor() {
    super('Books Service request timed out');
  }
}
