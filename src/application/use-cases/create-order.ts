import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  RequestTimeoutException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { Order } from 'src/domain/entities/order.entity';
import { OrderStatus } from 'src/domain/enums/order-status';
import {
  BookNotFoundError,
  BooksServiceTimeoutError,
  BooksServiceUnavailableError,
  InsufficientStockError,
  InvalidBookDataError,
  InvalidOrderDataError,
  InvalidQuantityError,
} from 'src/domain/errors/orders';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from 'src/domain/repositories/order.repository';
import { BookResponse } from 'src/domain/interfaces/book.interface';
import { isUUID } from 'class-validator';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(params: { bookId: string; quantity: number }): Promise<Order> {
    try {
      this.validateOrderParams(params);

      const book = await this.fetchBook(params.bookId);

      if (book.stock < params.quantity) {
        throw new InsufficientStockError(book.stock, params.quantity);
      }

      const totalPrice = book.price * params.quantity;

      const order = Order.create({
        id: uuid(),
        bookId: params.bookId,
        quantity: params.quantity,
        totalPrice,
        currency: book.currency,
        status: OrderStatus.PENDING,
      });
      return this.orderRepository.save(order);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async fetchBook(bookId: string): Promise<BookResponse> {
    try {
      const response = await axios.get<BookResponse>(
        `http://localhost:3000/books/${bookId}`,
      );
      if (!response?.data) {
        throw new BookNotFoundError(bookId);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new BookNotFoundError(bookId);
        }
        if (error.response?.status === 503) {
          throw new BooksServiceUnavailableError();
        }
        if (error.code === 'ECONNABORTED') {
          throw new BooksServiceTimeoutError();
        }
        throw error;
      }
      throw error;
    }
  }

  private validateOrderParams(params: { bookId: string; quantity: number }) {
    if (!isUUID(params.bookId.trim())) {
      throw new InvalidBookDataError('id', 'Invalid book ID format');
    }
    if (typeof params.quantity !== 'number') {
      throw new InvalidOrderDataError('quantity', 'Quantity must be a number');
    }
    if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
      throw new InvalidQuantityError(params.quantity);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof InvalidBookDataError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof InvalidOrderDataError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof InvalidQuantityError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof InsufficientStockError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof BookNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof BooksServiceUnavailableError) {
      throw new ServiceUnavailableException(error.message);
    }

    if (error instanceof BooksServiceTimeoutError) {
      throw new RequestTimeoutException(error.message);
    }

    throw error;
  }
}
