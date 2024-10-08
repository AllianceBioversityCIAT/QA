import { ApiProperty } from '@nestjs/swagger';

export class GetListEvaluationsDto {
  @ApiProperty({ type: String, description: 'Name of the view' })
  view_name: string;

  @ApiProperty({ type: String, description: 'Primary field of the view' })
  view_primary_field: string;
}

export class GetDetailedEvaluationDto {
  @ApiProperty({ type: String, description: 'Type of evaluation' })
  type: string;

  @ApiProperty({ type: Number, description: 'Indicator ID' })
  indicatorId: number;
}
