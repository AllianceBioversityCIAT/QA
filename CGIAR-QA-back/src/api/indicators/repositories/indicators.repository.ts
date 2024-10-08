import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Indicators } from '../entities/indicators.entity';
import { IndicatorsMeta } from '../entities/indicators-meta.entity';
import { BatchesRepository } from '../../../shared/repositories/batch.repository';
import moment from 'moment';

@Injectable()
export class IndicatorsRepository extends Repository<Indicators> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly _batchRepository: BatchesRepository,
  ) {
    super(Indicators, dataSource.createEntityManager());
  }

  async createMetaForIndicator(indicator: Indicators, primary_field: string) {
    const pols_meta = this.dataSource
      .getMetadata(indicator.view_name)
      .ownColumns.map((column) => column.propertyName);

    const indicatorMetaRepository =
      this.dataSource.getRepository(IndicatorsMeta);

    const savePromises = [];
    for (const element of pols_meta) {
      const indicator_meta = new IndicatorsMeta();
      indicator_meta.col_name = element;
      indicator_meta.display_name = element.split('_').join(' ');
      indicator_meta.enable_comments = true;
      indicator_meta.include_detail = true;
      indicator_meta.include_general = true;
      indicator_meta.indicator = indicator;

      indicator_meta.is_primay = element === primary_field;
      savePromises.push(indicator_meta);
    }

    try {
      const response = await indicatorMetaRepository.save(savePromises);
      return response;
    } catch (error) {
      return false;
    }
  }

  async getAdminIndicators() {
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        `
      SELECT DISTINCT name, description, primary_field, view_name, qa_indicators.order AS indicator_order
      FROM qa_indicators
      WHERE qa_indicators.is_active = 1
      ORDER BY indicator_order ASC
      `,
        {},
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getCRPIndicators(crpId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        `
      SELECT DISTINCT evaluations.indicator_view_name, indicators.name, indicators.description, indicators.primary_field, indicators.order AS indicator_order, indicators.view_name, comment_meta.enable_crp
      FROM qa_indicators indicators
      LEFT JOIN qa_comments_meta comment_meta ON comment_meta.indicatorId = indicators.id
      LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_name = indicators.view_name
      WHERE evaluations.crp_id = :crp_id AND indicators.is_active = 1
      ORDER BY indicator_order ASC
      `,
        { crp_id: crpId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getUserIndicators(userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        `
      SELECT indicators.name, indicators.description, indicators.primary_field, indicators.order AS indicator_order, indicators.view_name, meta.enable_assessor, qa_indicator_user.isLeader, qa_indicator_user.isTPB, qa_indicator_user.isPPU
      FROM qa_indicator_user qa_indicator_user
      LEFT JOIN qa_indicators indicators ON indicators.id = qa_indicator_user.indicatorId
      LEFT JOIN qa_comments_meta meta ON meta.indicatorId = qa_indicator_user.indicatorId
      WHERE qa_indicator_user.userId = :userId AND indicators.is_active = 1
      ORDER BY indicator_order ASC
      `,
        { userId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getItemStatusByIndicator(indicator: string, crpId?: string) {
    const totalEvaluationsByIndicator = {
      qa_impact_contribution: {},
      qa_other_outcome: {},
      qa_other_output: {},
      qa_capdev: {},
      qa_knowledge_product: {},
      qa_innovation_development: {},
      qa_policy_change: {},
      qa_innovation_use: {},
      qa_innovation_use_ipsr: {},
    };

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      let queryMetas = `
        SELECT col_name, display_name, indicatorId, qi.view_name,
          (SELECT count(*) FROM qa_evaluations qe WHERE qe.indicator_view_name = qi.view_name AND qe.phase_year = actual_phase_year() AND qe.status <> 'autochecked'`;

      if (crpId) {
        queryMetas += ` AND qe.crp_id = :crpId`;
      }

      queryMetas += `) AS total
        FROM qa_indicators_meta qim
        LEFT JOIN qa_indicators qi ON qi.id = qim.indicatorId
        WHERE qim.display_name NOT LIKE 'id'
          AND qim.enable_comments <> 0
          AND qim.include_detail = 1
          AND qi.view_name LIKE :indicator`;

      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          queryMetas,
          { indicator, crpId },
          {},
        );

      const allMetas = await queryRunner.connection.query(query, parameters);

      for (const meta of allMetas) {
        let queryNotApplicable = `
          SELECT count(*) as count
          FROM qa_evaluations qe
          LEFT JOIN ${meta.view_name} qi ON qe.indicator_view_id = qi.id AND qe.indicator_view_name = :viewName
          WHERE qi.${meta.col_name} = "<Not applicable>"
            AND qe.phase_year = actual_phase_year()
            AND qe.status <> "autochecked"`;

        if (crpId) {
          queryNotApplicable += ` AND qe.crp_id = :crpId`;
        }

        totalEvaluationsByIndicator[meta.view_name][meta.display_name] = {
          item: meta.display_name,
          pending: meta.total,
          approved_without_comment: 0,
          assessment_with_comments: 0,
          notApplicable: null,
          queryNotApplicable,
        };

        const [queryNA, parametersNA] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            queryNotApplicable,
            { viewName: meta.view_name, crpId },
            {},
          );

        const notApplicableCount = await queryRunner.connection.query(
          queryNA,
          parametersNA,
        );
        totalEvaluationsByIndicator[meta.view_name][
          meta.display_name
        ].notApplicable = +notApplicableCount[0].count;
        totalEvaluationsByIndicator[meta.view_name][
          meta.display_name
        ].pending -= +notApplicableCount[0].count;
      }

      let queryAssessmentByField = `
        SELECT display_name, col_name, approved_no_comment, indicator_view_name,
          SUM(IF(approved_no_comment = 0, 1, 0)) AS pending,
          SUM(IF(approved_no_comment = 1, 1, 0)) AS approved_without_comment,
          SUM(IF(approved_no_comment IS NULL, 1, 0)) AS assessment_with_comments,
          count(distinct qe.id) as comments_distribution
        FROM qa_indicators_meta qim
        LEFT JOIN qa_comments qc ON qc.metaId = qim.id
        LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
        WHERE qim.id = qc.metaId
          AND qim.display_name NOT LIKE 'id'
          AND qim.enable_comments = 1
          AND qim.include_detail = 1
          AND qe.evaluation_status NOT LIKE 'Removed'
          AND qe.phase_year = actual_phase_year()
          AND qe.indicator_view_name LIKE :indicator
          AND qc.is_deleted = 0
          AND enable_comments <> 0`;

      if (crpId) {
        queryAssessmentByField += ` AND qe.crp_id = :crpId`;
      }

      const [queryAssessment, parametersAssessment] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          queryAssessmentByField,
          { indicator, crpId },
          {},
        );

      const allItems = await queryRunner.connection.query(
        queryAssessment,
        parametersAssessment,
      );

      for (const item of allItems) {
        const indicatorView =
          totalEvaluationsByIndicator[item.indicator_view_name][
            item.display_name
          ];
        if (item.approved_no_comment === 1) {
          indicatorView.approved_without_comment =
            +item.approved_without_comment;
          indicatorView.pending -= +item.approved_without_comment;
        } else if (item.approved_no_comment === null) {
          indicatorView.assessment_with_comments =
            +item.assessment_with_comments;
          indicatorView.pending -= +item.comments_distribution;
        }
      }

      return totalEvaluationsByIndicator[indicator];
    } catch (error) {
      throw new Error('Error retrieving item status by indicator');
    } finally {
      await queryRunner.release();
    }
  }

  async getAllItemStatusByIndicator() {
    const totalEvaluationsByIndicator = {
      qa_impact_contribution: {},
      qa_other_outcome: {},
      qa_other_output: {},
      qa_capdev: {},
      qa_knowledge_product: {},
      qa_innovation_development: {},
      qa_policy_change: {},
      qa_innovation_use: {},
      qa_innovation_use_ipsr: {},
    };

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const [query, parameters] =
        queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT col_name, display_name, indicatorId, qi.view_name,
          (SELECT count(*) FROM qa_evaluations qe WHERE qe.indicator_view_name = qi.view_name AND qe.phase_year = actual_phase_year() AND qe.status <> 'autochecked') AS total
         FROM qa_indicators_meta qim
         LEFT JOIN qa_indicators qi ON qi.id = qim.indicatorId
         WHERE qim.display_name NOT LIKE 'id'
           AND qim.enable_comments <> 0
           AND qim.include_detail = 1`,
          {},
          {},
        );

      const allMetas = await queryRunner.connection.query(query, parameters);

      allMetas.forEach(
        (meta: {
          view_name: string | number;
          display_name: string | number;
          total: any;
        }) => {
          totalEvaluationsByIndicator[meta.view_name][meta.display_name] = {
            item: meta.display_name,
            pending: meta.total,
            approved_without_comment: 0,
            assessment_with_comments: 0,
          };
        },
      );

      const [queryAssessment, parametersAssessment] =
        queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT display_name, col_name, approved_no_comment, indicator_view_name,
          SUM(IF(approved_no_comment = 0, 1, 0)) AS pending,
          SUM(IF(approved_no_comment = 1, 1, 0)) AS approved_without_comment,
          SUM(IF(approved_no_comment IS NULL, 1, 0)) AS assessment_with_comments
         FROM qa_indicators_meta qim
         LEFT JOIN qa_comments qc ON qc.metaId = qim.id
         LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
         WHERE qim.id = qc.metaId
           AND qim.display_name NOT LIKE 'id'
           AND qim.enable_comments = 1
           AND qe.evaluation_status NOT LIKE 'Removed'
           AND qe.phase_year = actual_phase_year()
           AND qc.is_deleted = 0
           AND enable_comments <> 0
         GROUP BY display_name, col_name, approved_no_comment, indicator_view_name, approved_no_comment`,
          {},
          {},
        );

      const allItems = await queryRunner.connection.query(
        queryAssessment,
        parametersAssessment,
      );

      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const indicatorView =
          totalEvaluationsByIndicator[item.indicator_view_name][
            item.display_name
          ];

        if (item.approved_no_comment === 1) {
          indicatorView.approved_without_comment =
            item.approved_without_comment;
          indicatorView.pending -= item.approved_without_comment;
        } else if (item.approved_no_comment === null) {
          indicatorView.assessment_with_comments =
            item.assessment_with_comments;
          indicatorView.pending -= item.assessment_with_comments;
        }
      }

      return totalEvaluationsByIndicator;
    } catch (error) {
      throw new Error('Error retrieving all item status by indicator');
    } finally {
      await queryRunner.release();
    }
  }

  async getItemListStatusMIS(id: number, crpId: string, AR: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const indicator_view_name = await this.findOne({
        where: { id },
        select: ['view_name'],
      });

      const sql = `
        SELECT
          evaluations.id AS evaluation_id,
          evaluations.indicator_view_name,
          evaluations.indicator_view_id,
          evaluations.evaluation_status,
          evaluations.status,
          evaluations.crp_id,
          evaluations.phase_year,
          evaluations.batchDate,
          evaluations.require_second_assessment,
          evaluations.updatedAt,
          crp.acronym AS crp_acronym,
          crp.name AS crp_name,
          IF(
            (
              SELECT COUNT(id)
              FROM qa_comments
              WHERE qa_comments.evaluationId = evaluations.id
                AND approved_no_comment IS NULL
                AND metaId IS NOT NULL
                AND is_deleted = 0
                AND is_visible = 1
                AND detail IS NOT NULL
            ) <= (
              SELECT COUNT(id)
              FROM qa_comments_replies
              WHERE is_deleted = 0
                AND commentId IN (
                  SELECT id
                  FROM qa_comments
                  WHERE qa_comments.evaluationId = evaluations.id
                    AND approved_no_comment IS NULL
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND detail IS NOT NULL
                )
            ),
            false,
            true
          ) AS pending_replies
        FROM
          qa_evaluations evaluations
        LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
        LEFT JOIN qa_indicator_user indicator_user ON indicator_user.indicatorId = indicators.id
        WHERE (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
        AND evaluations.indicator_view_name = :indicator_view_name
        AND evaluations.crp_id = :crp_id
        AND evaluations.phase_year = :AR
        GROUP BY crp.crp_id, evaluations.id, indicator_user.indicatorId`;

      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          sql,
          {
            indicator_view_name: indicator_view_name.view_name,
            crp_id: crpId,
            AR,
          },
          {},
        );

      const evaluations = await queryRunner.connection.query(query, parameters);

      const batches = await this._batchRepository.find({
        where: { phase_year: AR },
      });

      const data = evaluations.map((e) => ({
        indicator_name: e.indicator_view_name.split('qa_')[1],
        id: e.indicator_view_id,
        crp_id: e.crp_id,
        assessment_status: this.calculateStatusMIS(e, batches),
        updatedAt: e.updatedAt,
      }));

      return data;
    } catch (error) {
      throw new Error('Error retrieving items for MIS');
    } finally {
      await queryRunner.release();
    }
  }

  async getItemStatusMIS(
    id: number,
    crpId: string,
    itemId: string,
    AR: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const indicator_view_name = await this.findOne({
        where: { id },
        select: ['view_name'],
      });

      const sql = `
        SELECT
          evaluations.id AS evaluation_id,
          evaluations.indicator_view_name,
          evaluations.indicator_view_id,
          evaluations.evaluation_status,
          evaluations.status,
          evaluations.crp_id,
          evaluations.phase_year,
          evaluations.batchDate,
          evaluations.require_second_assessment,
          evaluations.updatedAt,
          crp.acronym AS crp_acronym,
          crp.name AS crp_name,
          IF(
            (
              SELECT COUNT(id)
              FROM qa_comments
              WHERE qa_comments.evaluationId = evaluations.id
                AND approved_no_comment IS NULL
                AND metaId IS NOT NULL
                AND is_deleted = 0
                AND is_visible = 1
                AND detail IS NOT NULL
            ) <= (
              SELECT COUNT(id)
              FROM qa_comments_replies
              WHERE is_deleted = 0
                AND commentId IN (
                  SELECT id
                  FROM qa_comments
                  WHERE qa_comments.evaluationId = evaluations.id
                    AND approved_no_comment IS NULL
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND detail IS NOT NULL
                )
            ),
            false,
            true
          ) AS pending_replies
        FROM
          qa_evaluations evaluations
        LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
        LEFT JOIN qa_indicator_user indicator_user ON indicator_user.indicatorId = indicators.id
        WHERE (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
          AND evaluations.indicator_view_name = :indicator_view_name
          AND evaluations.crp_id = :crp_id
          AND evaluations.phase_year = :AR
          AND evaluations.indicator_view_id = :indicator_view_id
        GROUP BY crp.crp_id, evaluations.id, indicator_user.indicatorId`;

      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          sql,
          {
            indicator_view_name: indicator_view_name.view_name,
            crp_id: crpId,
            indicator_view_id: itemId,
            AR,
          },
          {},
        );

      const items = await queryRunner.connection.query(query, parameters);
      const item = items[0];

      const batches = await this._batchRepository.find({
        where: { phase_year: AR },
      });

      const data = {
        indicator_name: item.indicator_view_name.split('qa_')[1],
        id: item.indicator_view_id,
        crp_id: item.crp_id,
        assessment_status: this.calculateStatusMIS(item, batches),
        updatedAt: item.updatedAt,
      };

      return data;
    } catch (error) {
      throw new Error('Error retrieving item status for MIS');
    } finally {
      await queryRunner.release();
    }
  }

  calculateStatusMIS(evaluation, batches) {
    let status = 'pending';

    try {
      if (evaluation.phase_year === '2021') {
        const current_batch = batches.find((b) =>
          moment(b.submission_date).isSame(evaluation.batchDate, 'day'),
        );

        switch (evaluation.status) {
          case 'Autochecked':
            status = 'autochecked';
            break;
          case 'Pending':
            status = 'pending';
            break;
          case 'Finalized':
            if (
              moment(Date.now()).isBefore(current_batch.programs_start_date)
            ) {
              status = 'pending';
            } else if (
              moment(Date.now()).isSameOrAfter(
                current_batch.programs_start_date,
              )
            ) {
              if (evaluation.pending_replies) {
                status = 'pending_crp';
              } else {
                status = evaluation.require_second_assessment
                  ? 'in_progress'
                  : 'finalized';
              }
            }
            break;
          default:
            break;
        }
      } else {
        status = 'legacy_status';
      }
    } catch (error) {
      return status;
    }

    return status;
  }
}
