import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TagType } from '../entities/tags-type.entity';

@Injectable()
export class TagTypeRepository extends Repository<TagType> {
  constructor(private dataSource: DataSource) {
    super(TagType, dataSource.createEntityManager());
  }
}
