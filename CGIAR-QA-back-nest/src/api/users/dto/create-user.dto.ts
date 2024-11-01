import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username of the new user', example: 'johndoe' })
  username: string;

  @ApiProperty({
    description: 'Password of the new user',
    example: 'strongpassword123',
  })
  password: string;

  @ApiProperty({
    description: 'List of role IDs assigned to the user',
    example: [1, 2],
  })
  roles: number[];

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'ID of the CRP assigned to the user',
    example: 1,
    required: false,
  })
  crpId?: number;

  @ApiProperty({
    description: 'Flag indicating if the user is a Marlo user',
    example: false,
  })
  is_marlo: boolean;
}
