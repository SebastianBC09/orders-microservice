import { Injectable } from '@nestjs/common';
import { Prisma, OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { Order } from 'src/domain/entities/order.entity';
import { OrderStatus } from 'src/domain/enums/order-status';
import { OrderRepository } from 'src/domain/repositories/order.repository';
import {
  InvalidQuantityError,
  OrdersNotFoundError,
} from 'src/domain/errors/orders';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaService) {}

  private mapToPrismaStatus(status: OrderStatus): PrismaOrderStatus {
    return status as PrismaOrderStatus;
  }

  private mapFromPrismaStatus(status: PrismaOrderStatus): OrderStatus {
    return status as OrderStatus;
  }

  async save(order: Order): Promise<Order> {
    try {
      const record = await this.prisma.order.create({
        data: {
          id: order.id,
          bookId: order.bookId,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          status: this.mapToPrismaStatus(order.status),
          currency: order.currency,
          createdAt: order.createdAt,
        },
      });
      return Order.restore({
        ...record,
        status: this.mapFromPrismaStatus(record.status),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new InvalidQuantityError(order.quantity);
      }
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      const records = await this.prisma.order.findMany();

      if (!records || records.length === 0) {
        throw new OrdersNotFoundError();
      }

      return records.map((record) =>
        Order.restore({
          ...record,
          status: this.mapFromPrismaStatus(record.status),
        }),
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2021'
      ) {
        throw new OrdersNotFoundError();
      }
      throw error;
    }
  }
}
