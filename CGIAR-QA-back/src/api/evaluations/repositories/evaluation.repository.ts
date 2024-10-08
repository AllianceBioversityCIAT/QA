import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Evaluations } from '../entities/evaluation.entity';
import { StatusHandler } from '../enum/status-handler.enum';
import { Users } from '../../users/entities/user.entity';

@Injectable()
export class EvaluationRepository extends Repository<Evaluations> {
  constructor(private readonly dataSource: DataSource) {
    super(Evaluations, dataSource.createEntityManager());
  }

  getType(status: StatusHandler, isCrp?: boolean): string {
    let res = '';
    switch (status) {
      case StatusHandler.Pending:
        res = 'danger';
        break;
      case StatusHandler.Complete:
        res = 'success';
        break;
      case StatusHandler.Finalized:
        res = 'info';
        break;
      default:
        break;
    }

    return res;
  }

  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result: Record<string, T[]>, currentValue: T) => {
      const groupKey = currentValue[key];
      const groupKeyStr = String(groupKey);
      if (!result[groupKeyStr]) {
        result[groupKeyStr] = [];
      }
      result[groupKeyStr].push(currentValue);
      return result;
    }, {});
  }

  async getEvaluationsForCrp(crpId: string, userId: number) {
    const userRepository = this.manager.getRepository(Users);
    const user = await userRepository.findOneOrFail({ where: { id: userId } });
    const queryRunner = this.dataSource.createQueryRunner();

    let sqlQuery = '';
    if (user.roles[0].description === 'admin') {
      sqlQuery = `
        SELECT
          evaluations.crp_id AS crp_id,
          evaluations.indicator_view_name AS indicator_view_name,
          indicator.primary_field AS primary_field,
          (SELECT enable_crp FROM qa_comments_meta comments_meta WHERE comments_meta.indicatorId = indicator.id) AS indicator_status,
          indicator.order AS indicator_order, 
          COUNT(DISTINCT evaluations.id) AS count,
          evaluations.status AS evaluations_status,
          (SELECT COUNT(qc.id) FROM qadb.qa_comments qc INNER JOIN qadb.qa_evaluations qe ON qc.evaluationId = qe.id WHERE qc.tpb = 1 AND qc.ppu = 0) AS tpb_count
        FROM
          qa_evaluations evaluations
        LEFT JOIN qa_indicators indicator ON indicator.view_name = evaluations.indicator_view_name
        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
        WHERE (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
          AND evaluations.crp_id = '${crpId}'
          AND evaluations.indicator_view_name <> 'qa_outcomes'
          AND evaluations.phase_year = actual_phase_year()
          AND evaluations.batchDate >= actual_batch_date()
        GROUP BY evaluations_status, evaluations.indicator_view_name, evaluations.crp_id, indicator_order, indicator.id, indicator.primary_field
        ORDER BY indicator.order ASC, evaluations_status DESC
      `;
    }

    const [query, parameters] =
      await queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        {},
        {},
      );

    return await queryRunner.connection.query(query, parameters);
  }

  async getEvaluations() {
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      await queryRunner.connection.driver.escapeQueryWithParameters(
        `
        SELECT
          evaluations.status AS status,
          indicator.view_name AS indicator_view_name,
          indicator.primary_field AS primary_field,
          indicator.order AS indicator_order,
          COUNT(DISTINCT evaluations.id) AS count
        FROM
          qa_indicator_user qa_indicator_user
        LEFT JOIN qa_indicators indicator ON indicator.id = qa_indicator_user.indicatorId
        LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_name = indicator.view_name
        AND evaluations.phase_year = actual_phase_year()
        AND (evaluations.evaluation_status <> 'Deleted' AND evaluations.evaluation_status <> 'Removed' OR evaluations.evaluation_status IS NULL)
        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
        WHERE evaluations.batchDate >= actual_batch_date()
        GROUP BY evaluations.status, indicator.view_name, indicator_order, indicator.primary_field
        ORDER BY indicator.order ASC, evaluations.status
        `,
        {},
        {},
      );

    return await queryRunner.connection.query(query, parameters);
  }
}
