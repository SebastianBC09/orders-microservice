import { Module } from '@nestjs/common';
import { CreateOrderUseCase } from 'src/application/use-cases/create-order';
import { ListOrdersUseCase } from 'src/application/use-cases/list-orders';
import { ORDER_REPOSITORY } from 'src/domain/repositories/order.repository';
import { PrismaOrderRepository } from 'src/infraestructure/prisma/order.prisma.repository';
import { OrderController } from 'src/interfaces/controllers/order.controller';

@Module({
  controllers: [OrderController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrderModule {}
