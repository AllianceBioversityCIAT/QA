import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusGeneralHandler } from '../../../shared/enum/status-general-handler.enum';

export class CreateGeneralConfigDto {
  @ApiProperty({
    description: 'The start date of the configuration',
    type: Date,
    example: '2024-01-01',
  })
  start_date: Date;

  @ApiProperty({
    description: 'The end date of the configuration',
    type: Date,
    example: '2024-12-31',
  })
  end_date: Date;

  @ApiProperty({
    description: 'Role associated with the configuration',
    type: Number,
    example: 1,
  })
  role: number; // Se espera el ID de la relación

  @ApiProperty({
    description: 'Status of the configuration',
    enum: StatusGeneralHandler,
    example: StatusGeneralHandler.Open,
  })
  status: StatusGeneralHandler;

  @ApiPropertyOptional({
    description: 'Guideline for annual report',
    example: 'http://example.com/guidelines/annual-report',
  })
  anual_report_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for assessors',
    example: 'http://example.com/guidelines/assessors',
  })
  assessors_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for innovations',
    example: 'http://example.com/guidelines/innovations',
  })
  innovations_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for partnerships',
    example: 'http://example.com/guidelines/partnerships',
  })
  partnerships_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for capacity development',
    example: 'http://example.com/guidelines/capdev',
  })
  capdev_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for peer review papers',
    example: 'http://example.com/guidelines/peer-review',
  })
  peer_review_paper_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for policies',
    example: 'http://example.com/guidelines/policies',
  })
  policies_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for altmetrics',
    example: 'http://example.com/guidelines/almetrics',
  })
  almetrics_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for uptake',
    example: 'http://example.com/guidelines/uptake',
  })
  uptake_guideline?: string;

  @ApiPropertyOptional({
    description: 'Guideline for OICR',
    example: 'http://example.com/guidelines/oicr',
  })
  oicr_guideline?: string;
}
