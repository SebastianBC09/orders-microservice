import { Body, Controller, Get, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateOrderUseCase } from 'src/application/use-cases/create-order';
import { ListOrdersUseCase } from 'src/application/use-cases/list-orders';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetOrderDto } from '../dto/get-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of orders' })
  @ApiResponse({ status: 404, description: 'Orders not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async listOrders() {
    const orders = await this.listOrdersUseCase.execute();
    return plainToInstance(GetOrderDto, orders, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.createOrderUseCase.execute(createOrderDto);
  }
}
