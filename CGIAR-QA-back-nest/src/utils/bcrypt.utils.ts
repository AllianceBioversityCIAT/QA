import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptPasswordEncoder {
  public matches(rawPassword: string, hashedPassword: string): boolean {
    try {
      return bcrypt.compareSync(rawPassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  public encode(incomingPassword: any): string {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(incomingPassword, salt);
  }
}
