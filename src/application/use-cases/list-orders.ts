import {
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Order } from 'src/domain/entities/order.entity';
import {
  BooksServiceTimeoutError,
  BooksServiceUnavailableError,
  OrdersNotFoundError,
} from 'src/domain/errors/orders';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from 'src/domain/repositories/order.repository';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(): Promise<Order[]> {
    try {
      return await this.orderRepository.findAll();
    } catch (error) {
      if (error instanceof OrdersNotFoundError) {
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
}
