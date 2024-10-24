import { ApiProperty } from '@nestjs/swagger';
import { StatusHandler } from '../enum/status-handler.enum';

export class GetListEvaluationsDto {
  @ApiProperty({ type: String, description: 'Name of the view' })
  view_name: string;

  @ApiProperty({ type: String, description: 'Primary field of the view' })
  view_primary_field: string;
}

export class GetDetailedEvaluationDto {
  @ApiProperty({
    type: String,
    description: 'Type of evaluation',
    example: 'capdev',
  })
  type: string;

  @ApiProperty({ type: Number, description: 'Indicator ID' })
  indicatorId: number;
}

export class UpdateDetailedEvaluationDto {
  @ApiProperty({ type: String, description: 'Status of the evaluation' })
  status: StatusHandler;

  @ApiProperty({ type: String, description: 'Comments', required: false })
  general_comments?: string | undefined;
}

export class PatchHighlightCommentDto {
  @ApiProperty({ type: Number, description: 'Comment ID' })
  id: number;

  @ApiProperty({ type: Boolean, description: 'Highlight comment' })
  highlight_comment: boolean;
}

export class PatchRequireChangesDto {
  @ApiProperty({ type: Number, description: 'Comment ID' })
  id: number;

  @ApiProperty({ type: Boolean, description: 'Require changes' })
  require_changes: boolean;
}

export class CreateTagDto {
  @ApiProperty({ type: Number, description: 'User ID' })
  userId: number;

  @ApiProperty({ type: Number, description: 'Comment ID' })
  commentId: number;

  @ApiProperty({ type: Number, description: 'Tag type ID' })
  tagTypeId: number;
}

export class CreateCommentDto {
  @ApiProperty({ type: String, description: 'Detail' })
  detail: string;

  @ApiProperty({ type: Boolean, description: 'Approve' })
  approved: boolean;

  @ApiProperty({ type: Number, description: 'User ID' })
  userId: number;

  @ApiProperty({ type: Number, description: 'Meta ID' })
  metaId: number;

  @ApiProperty({ type: Number, description: 'Evaluation ID' })
  evaluationId: number;

  @ApiProperty({ type: String, description: 'Original field' })
  original_field: string;

  @ApiProperty({ type: Boolean, description: 'Require changes' })
  require_changes: boolean;

  @ApiProperty({ type: Boolean, description: 'TPB' })
  tpb: boolean;
}

export class CreateReplyDto {
  @ApiProperty({ type: String, description: 'Detail' })
  detail: string;

  @ApiProperty({ type: Number, description: 'User ID' })
  userId: number;

  @ApiProperty({ type: String, description: 'Comment ID' })
  commentId: number;

  @ApiProperty({ type: Boolean, description: 'CRP approved' })
  crp_approved: boolean;

  @ApiProperty({ type: Boolean, description: 'Approved' })
  approved: boolean;

  @ApiProperty({ type: Number, description: 'Reply type ID' })
  replyTypeId: number;
}

export class UpdateCommentDto {
  @ApiProperty({ type: String, description: 'Detail' })
  detail: string;

  @ApiProperty({ type: Boolean, description: 'Approve' })
  approved: boolean;

  @ApiProperty({ type: Number, description: 'User ID' })
  userId: number;

  @ApiProperty({ type: Boolean, description: 'Require changes' })
  require_changes: boolean;

  @ApiProperty({ type: Boolean, description: 'TPB' })
  tpb: boolean;

  @ApiProperty({ type: Boolean, description: 'Is Visible' })
  is_visible: boolean;

  @ApiProperty({ type: Boolean, description: 'Is Delete' })
  is_deleted: boolean;

  @ApiProperty({ type: Number, description: 'Comment ID' })
  id: number;
}

export class UpdateReplyDto {
  @ApiProperty({ type: Boolean, description: 'Is Delete' })
  is_deleted: boolean;

  @ApiProperty({ type: Number, description: 'Detail' })
  id: number;

  @ApiProperty({ type: String, description: 'Detail' })
  detail: string;

  @ApiProperty({ type: Number, description: 'Detail' })
  userId: number;
}

export class UpdateRequireSecondEvaluationDto {
  @ApiProperty({ type: Boolean, description: 'Require second assessment' })
  require_second_assessment: boolean;
}
