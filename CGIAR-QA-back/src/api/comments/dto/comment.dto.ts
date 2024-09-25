import { ApiProperty } from '@nestjs/swagger';

export class UpdateCycleDto {
  @ApiProperty({ example: 1, description: 'ID of the cycle' })
  id: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date of the cycle',
  })
  start_date: Date;

  @ApiProperty({ example: '2024-12-31', description: 'End date of the cycle' })
  end_date: Date;
}

export class PatchPpuDto {
  @ApiProperty({ description: 'PPU status', example: 1 })
  ppu: number;

  @ApiProperty({ description: 'Comment Reply ID', example: 123 })
  commentReplyId: number;
}
