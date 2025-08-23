import { Order } from '../entities/order.entity';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findAll(): Promise<Order[]>;
}

export const ORDER_REPOSITORY = Symbol('OrderRepository');
