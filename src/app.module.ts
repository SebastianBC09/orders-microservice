import { Module } from '@nestjs/common';
import { PrismaModule } from './infraestructure/prisma/prisma.module';
import { OrderModule } from './modules/order.module';

@Module({
  imports: [PrismaModule, OrderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
