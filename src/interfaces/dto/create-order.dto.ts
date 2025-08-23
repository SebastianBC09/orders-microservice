import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'The ID of the book to order',
    example: '1234567890',
  })
  @Allow()
  bookId: string;

  @ApiProperty({
    description: 'The quantity of the book to order',
    example: 2,
  })
  @Allow()
  quantity: number;
}
