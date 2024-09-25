import { ApiProperty } from '@nestjs/swagger';

export class EmbedTokenDto {
  @ApiProperty({ type: String, description: 'Token' })
  token: string;

  @ApiProperty({ type: Date, description: 'Expiration date' })
  expiration_date: Date;

  @ApiProperty({
    type: String,
    description: 'Users id',
  })
  crp_id: string;

  @ApiProperty({ type: String, description: 'Username' })
  username: string;

  @ApiProperty({ type: String, description: 'Email' })
  email: string;
  
  @ApiProperty({ type: String, description: 'Name' })
  name: string;

  @ApiProperty({ type: Number, description: 'App user' })
  app_user: number;
}
