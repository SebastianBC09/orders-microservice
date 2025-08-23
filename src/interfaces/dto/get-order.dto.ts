import { Expose } from 'class-transformer';

export class GetOrderDto {
  @Expose()
  id: string;

  @Expose()
  bookId: string;

  @Expose()
  quantity: number;

  @Expose()
  totalPrice: number;

  @Expose()
  currency: string;

  @Expose()
  status: string;
}
