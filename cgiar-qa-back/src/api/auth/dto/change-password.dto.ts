import { PartialType } from '@nestjs/mapped-types';
import { LoginDto } from './login.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto extends PartialType(LoginDto) {
  @ApiProperty({ type: String, description: 'Old password' })
  oldPassword: string;

  @ApiProperty({ type: String, description: 'New password' })
  newPassword: string;
}
