import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TokenAuth } from '../entities/token-auth.entity';

@Injectable()
export class TokenAuthRepository extends Repository<TokenAuth> {
  private readonly _logger = new Logger(TokenAuthRepository.name);

  constructor(private dataSource: DataSource) {
    super(TokenAuth, dataSource.createEntityManager());
  }
}
