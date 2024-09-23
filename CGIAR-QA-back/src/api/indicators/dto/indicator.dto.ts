import { ApiProperty } from '@nestjs/swagger';

export class CreateIndicatorDto {
  @ApiProperty({
    example: 'Indicator Name',
    description: 'Name of the indicator',
  })
  name: string;

  @ApiProperty({
    example: 'Description of the indicator',
    description: 'Indicator description',
  })
  description: string;

  @ApiProperty({
    example: 'view_name',
    description: 'View name for the indicator',
  })
  view_name: string;

  @ApiProperty({
    example: 'primary_field',
    description: 'Primary field for the indicator',
  })
  primary_field: string;
}

export class AssignIndicatorDto {
  @ApiProperty({ example: 1, description: 'ID of the user' })
  user_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the indicator',
    required: false,
  })
  indicator_id: number;

  @ApiProperty({ example: 1, description: 'CRP ID', required: false })
  crpId: number;
}

export class UpdateIndicatorDto {
  @ApiProperty({
    example: 'Updated Indicator Name',
    description: 'Name of the indicator',
  })
  name: string;

  @ApiProperty({
    example: 'Updated description of the indicator',
    description: 'Indicator description',
  })
  description: string;

  @ApiProperty({
    example: 'updated_view_name',
    description: 'View name for the indicator',
  })
  view_name: string;

  @ApiProperty({
    example: 'updated_primary_field',
    description: 'Primary field for the indicator',
    required: false,
  })
  primary_field?: string;
}
