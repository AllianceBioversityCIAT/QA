import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GeneralConfiguration } from '../entities/general-config.entity';

@Injectable()
export class GeneralConfigurationRepository extends Repository<GeneralConfiguration> {
  constructor(private datasource: DataSource) {
    super(GeneralConfiguration, datasource.createEntityManager());
  }
}
