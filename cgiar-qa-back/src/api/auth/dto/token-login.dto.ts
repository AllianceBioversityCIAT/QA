import { ApiProperty } from '@nestjs/swagger';

export class TokenLoginDto {
  @ApiProperty({ type: String, description: 'CRP ID' })
  crp_id: string;

  @ApiProperty({ type: String, description: 'Token' })
  token: string;
}
