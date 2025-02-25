import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cycle } from '../entities/cycle.entity';

@Injectable()
export class CycleRepository extends Repository<Cycle> {
  constructor(private datasource: DataSource) {
    super(Cycle, datasource.createEntityManager());
  }

  async getCurrentCycle(): Promise<Cycle> {
    return await this.createQueryBuilder('cycle')
      .where('DATE(cycle.start_date) <= CURDATE()')
      .andWhere('DATE(cycle.end_date) > CURDATE()')
      .getOne();
  }

  async getAllCycles() {
    return this.createQueryBuilder('cycle').getMany();
  }

  async getActualCycle() {
    try {
      const query = 'SELECT actual_batch_date()';
      const result = await this.query(query);
      return result[0]['actual_batch_date()'];
    } catch (error) {
      console.error(error);
    }
  }

  async findCycleById(id: number) {
    return this.createQueryBuilder('cycle')
      .where('cycle.id = :id', { id })
      .getOne();
  }

  async updateCycle(cycle: Cycle) {
    return await this.save(cycle);
  }
}
