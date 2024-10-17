import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Evaluations } from '../entities/evaluation.entity';
import { StatusHandler } from '../enum/status-handler.enum';
import { Users } from '../../users/entities/user.entity';
import { DisplayTypeHandler } from '../enum/display-handler.enum';
import * as moment from 'moment';
import { Comments } from '../../comments/entities/comments.entity';
import { IndicatorsMeta } from '../../indicators/entities/indicators-meta.entity';
import { Cycle } from '../../../shared/entities/cycle.entity';

@Injectable()
export class EvaluationRepository extends Repository<Evaluations> {
  constructor(private readonly dataSource: DataSource) {
    super(Evaluations, dataSource.createEntityManager());
  }

  async getUser(userId: number): Promise<Users> {
    if (!userId) return;
    const userRepository = this.dataSource.getRepository(Users);
    return await userRepository.findOneOrFail({ where: { id: userId } });
  }

  async getEvaluationsByCrpId(crpId: string, role: number): Promise<any> {
    if (role !== 1) return [];
    let sqlQuery = `
        SELECT
            evaluations.crp_id AS crp_id,
            evaluations.indicator_view_name AS indicator_view_name,
            indicator.primary_field AS primary_field,
            (SELECT enable_crp FROM qa_comments_meta comments_meta WHERE comments_meta.indicatorId = indicator.id) AS indicator_status,
            indicator.order AS indicator_order,
            COUNT(DISTINCT evaluations.id) AS count,
            evaluations.status AS evaluations_status,
            (SELECT COUNT(qc.id) FROM qa_comments qc INNER JOIN qa_evaluations qe ON qc.evaluationId = qe.id WHERE qc.tpb = 1 AND qc.ppu = 0) AS tpb_count
        FROM
            qa_evaluations evaluations
        LEFT JOIN qa_indicators indicator ON indicator.view_name = evaluations.indicator_view_name
        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
        WHERE 
            (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
            AND evaluations.crp_id = '${crpId}'
            AND evaluations.indicator_view_name <> 'qa_outcomes'
            AND evaluations.phase_year = actual_phase_year()
            AND evaluations.batchDate >= actual_batch_date()
        GROUP BY
            evaluations_status, evaluations.indicator_view_name, evaluations.crp_id, indicator_order, indicator.id, indicator.primary_field
        ORDER BY indicator.order ASC, evaluations_status DESC;
    `;

    const [query, parameters] =
      this.dataSource.driver.escapeQueryWithParameters(sqlQuery, {}, {});
    return await this.dataSource.query(query, parameters);
  }

  async getAllEvaluations(): Promise<any> {
    const sqlQuery = `
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
        WHERE 
            evaluations.batchDate >= actual_batch_date()
        GROUP BY
            evaluations.status, indicator.view_name, indicator_order, indicator.primary_field
        ORDER BY indicator.order ASC, evaluations.status;
    `;

    const [query, parameters] =
      this.dataSource.driver.escapeQueryWithParameters(sqlQuery, {}, {});
    return await this.dataSource.query(query, parameters);
  }

  async getEvaluationsAdmin(viewName: string): Promise<any> {
    const sqlQuery = `
      SELECT
                    evaluations.id AS evaluation_id,
                    evaluations.status AS evaluations_status,
                    evaluations.indicator_view_name,
                    evaluations.indicator_view_id,
                    evaluations.evaluation_status,
                    evaluations.batchDate as submission_date,
                    evaluations.require_second_assessment,
                    evaluations.crp_id AS initiative, 
                    crp.acronym AS short_name,
                    crp.name AS crp_name,
                    (
                        SELECT
                            COUNT(id)
                        FROM
                            qa_comments
                        WHERE
                            qa_comments.evaluationId = evaluations.id
                        AND approved_no_comment IS NULL
                        AND metaId IS NOT NULL
                        AND is_deleted = 0
                        AND is_visible = 1
                        AND detail IS NOT NULL
                        AND cycleId = 1
                    ) AS comments_count,
                    (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                    NOT NULL AND is_deleted = 0 AND is_visible = 1 AND crp_approved = 1) AS comments_accepted_count,
                    (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                    NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 4) AS comments_accepted_with_comment_count,
					(SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                    NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 2) AS comments_disagreed_count,
                    (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                    NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 3) AS comments_clarification_count,
                    (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                    NOT NULL AND is_deleted = 0 AND is_visible = 1 AND highlight_comment = 1) AS comments_highlight_count,
                        (
                            SELECT
                                COUNT(id)
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                                AND tpb = 1
                                AND metaId IS NOT NULL
                                AND is_deleted = 0
                                AND is_visible = 1
                                LIMIT 1
                        ) AS comments_tpb_count,
                        (
                            SELECT
                                COUNT(id)
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                                AND ppu = 1
                                AND metaId IS NOT NULL
                                AND is_deleted = 0
                                AND is_visible = 1
                                LIMIT 1
                        ) AS comments_ppu_count,
                    ( SELECT kp.is_melia FROM qa_knowledge_product_data kp WHERE evaluations.indicator_view_id = kp.id ) AS is_melia,
                    ( SELECT kp.knowledge_product_type FROM qa_knowledge_product_data kp WHERE evaluations.indicator_view_id = kp.id ) AS knowledge_product_type,
                    ( SELECT COUNT(id) FROM qa_comments_replies WHERE commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL	AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) AND is_deleted = 0 ) AS comments_replies_count,
                    (
                        SELECT title FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
                    ) AS title,
                    (
                        SELECT version FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
                    ) AS version,
                    crp.action_area AS crp_action_area,
                    (
                        SELECT result_code FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
                    ) AS result_code,
                    (
                        SELECT
                        group_concat(DISTINCT users.username)
                        FROM
                            qa_evaluations_assessed_by_qa_users qea
                            LEFT JOIN qa_users users ON users.id = qea.qaUsersId
                        WHERE
                            qea.qaEvaluationsId = evaluations.id
                    ) comment_by,
                    (
                        SELECT
                            group_concat(DISTINCT users2.username)
                        FROM
                            qa_users users2
                            LEFT JOIN qa_comments comments2 ON evaluations.id = comments2.evaluationId
                        WHERE
                            users2.id = comments2.highlightById
                            AND comments2.cycleId = 2
                    ) assessed_r2
                FROM
                    qa_evaluations evaluations
                LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
                LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
                LEFT JOIN qa_knowledge_product_data kp ON kp.id = evaluations.indicator_view_id
                WHERE (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
                AND evaluations.indicator_view_name = :view_name
                AND evaluations.phase_year = actual_phase_year()
                GROUP BY
                    crp.crp_id,
                    evaluations.id
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { view_name: viewName },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getEvaluationsByCrpIdAndView(
    viewName: string,
    crpId: string,
  ): Promise<any> {
    const sqlQuery = `
     SELECT
            evaluations.id AS evaluation_id,
            evaluations.indicator_view_name,
            evaluations.indicator_view_id,
            evaluations.evaluation_status,
            evaluations.status as assessment_status,
            evaluations.batchDate as submission_date,
            evaluations.require_second_assessment,
            evaluations.crp_id AS initiative,
            crp.acronym AS short_name,
            crp.name AS crp_name,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments
                WHERE
                    qa_comments.evaluationId = evaluations.id
                    AND approved_no_comment IS NULL
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND detail IS NOT NULL
                    AND cycleId = 1
                    AND createdAt >= actual_batch_date()
            ) AS comments_count,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments
                WHERE
                    qa_comments.evaluationId = evaluations.id
                    AND approved_no_comment IS NULL
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND replyTypeId = 2
                    AND createdAt >= actual_batch_date()
            ) AS comments_disagreed_count,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments
                WHERE
                    qa_comments.evaluationId = evaluations.id
                    AND approved_no_comment IS NULL
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND crp_approved = 1
                    AND createdAt >= actual_batch_date()
            ) AS comments_accepted_count,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments
                WHERE
                    qa_comments.evaluationId = evaluations.id
                    AND highlight_comment = 1
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND createdAt >= actual_batch_date()
                LIMIT
                    1
            ) AS comments_highlight_count,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments
                WHERE
                    qa_comments.evaluationId = evaluations.id
                    AND tpb = 1
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                    AND createdAt >= actual_batch_date()
                LIMIT
                    1
            ) AS comments_tpb_count,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments
                WHERE
                    qa_comments.evaluationId = evaluations.id
                    AND ppu = 1
                    AND metaId IS NOT NULL
                    AND is_deleted = 0
                    AND is_visible = 1
                LIMIT
                    1
            ) AS comments_ppu_count,
            (
                SELECT
                    COUNT(id)
                FROM
                    qa_comments_replies
                WHERE
                    is_deleted = 0
                    AND commentId IN (
                        SELECT
                            id
                        FROM
                            qa_comments
                        WHERE
                            qa_comments.evaluationId = evaluations.id
                            AND approved_no_comment IS NULL
                            AND metaId IS NOT NULL
                            AND is_deleted = 0
                            AND is_visible = 1
                            AND createdAt >= actual_batch_date()
                    )
                    AND is_deleted = 0
            ) AS comments_replies_count,
            (
              SELECT title FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
            ) AS title,
            (
              SELECT version FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
            ) AS version,
            crp.action_area AS crp_action_area,
            (
              SELECT result_code FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
            ) AS result_code,
            indicator_user.indicatorId,
            IF(
                (
                    SELECT
                        COUNT(id)
                    FROM
                        qa_comments
                    WHERE
                        qa_comments.evaluationId = evaluations.id
                        AND approved_no_comment IS NULL
                        AND metaId IS NOT NULL
                        AND is_deleted = 0
                        AND is_visible = 1
                        AND detail IS NOT NULL
                        AND cycleId = 1
                      AND createdAt >= actual_batch_date()
                ) = (
                    SELECT
                        COUNT(id)
                    FROM
                        qa_comments_replies
                    WHERE
                        is_deleted = 0
                        AND commentId IN (
                            SELECT
                                id
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                                AND approved_no_comment IS NULL
                                AND metaId IS NOT NULL
                                AND is_deleted = 0
                                AND is_visible = 1
                                AND detail IS NOT NULL
                                AND cycleId = 1
                                AND createdAt >= actual_batch_date()
                        )
                ),
                "complete",
                "pending"
            ) AS evaluations_status_round_1,
            IF(
                (
                    SELECT
                        COUNT(id)
                    FROM
                        qa_comments
                    WHERE
                        qa_comments.evaluationId = evaluations.id
                        AND metaId IS NOT NULL
                        AND is_deleted = 0
                        AND is_visible = 1
                        AND detail IS NOT NULL
                      AND createdAt >= actual_batch_date()
                ) = (
                    SELECT
                        COUNT(id)
                    FROM
                        qa_comments
                    WHERE
                        qa_comments.evaluationId = evaluations.id
                        AND qa_comments.approved_no_comment IS NULL
                        AND qa_comments.metaId IS NOT NULL
                        AND qa_comments.is_deleted = 0
                        AND qa_comments.is_visible = 1
                        AND qa_comments.detail IS NOT NULL
                        AND qa_comments.crp_approved IS NOT NULL
                        AND createdAt >= actual_batch_date()
                ),
                "complete",
                "pending"
            ) AS evaluations_status,
            (
                SELECT
                    kp.is_melia
                FROM
                    qa_knowledge_product_data kp
                WHERE
                    evaluations.indicator_view_id = kp.id
            ) AS is_melia,
            (
                SELECT
                    kp.knowledge_product_type
                FROM
                    qa_knowledge_product_data kp
                WHERE
                    evaluations.indicator_view_id = kp.id
            ) AS knowledge_product_type
        FROM
            qa_evaluations evaluations
            LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
            LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
            AND crp.active = 1
            AND crp.qa_active = 'open'
            LEFT JOIN qa_indicator_user indicator_user ON indicator_user.indicatorId = indicators.id
            LEFT JOIN qa_knowledge_product_data kp ON kp.id = evaluations.indicator_view_id
        WHERE
            (
                evaluations.evaluation_status <> 'Deleted'
                OR evaluations.evaluation_status IS NULL
            )
            AND evaluations.indicator_view_name = :view_name
            AND evaluations.crp_id = :crp_id
            AND evaluations.phase_year = actual_phase_year()
            AND evaluations.batchDate >= actual_batch_date()
        GROUP BY
            crp.crp_id,
            evaluations.id,
            indicator_user.indicatorId;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { view_name: viewName, crp_id: crpId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getEvaluationsByIndicator(id: number, viewName: string): Promise<any> {
    const sqlQuery = `
      SELECT
                        evaluations.id AS evaluation_id,
                        evaluations.status AS evaluations_status,
                        evaluations.indicator_view_name,
                        evaluations.indicator_view_id,
                        evaluations.evaluation_status,
                        evaluations.batchDate as submission_date,
                        evaluations.require_second_assessment,
                        evaluations.crp_id AS initiative,
                        crp.acronym AS short_name,
                        crp.name AS crp_name,
                        (
                            SELECT
                                COUNT(id)
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                            AND approved_no_comment IS NULL
                            AND metaId IS NOT NULL
                            AND is_deleted = 0
                            AND is_visible = 1
                            AND detail IS NOT NULL
                            AND cycleId = 1
                        ) AS comments_count,
                        (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                        NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 1) AS comments_accepted_count,
                        (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                        NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 4) AS comments_accepted_with_comment_count,
                        (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                        NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 2) AS comments_disagreed_count,
                        (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                        NOT NULL AND is_deleted = 0 AND is_visible = 1 AND replyTypeId = 3) AS comments_clarification_count,
                        (
                            SELECT
                                COUNT(id)
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                                AND highlight_comment = 1
                                AND metaId IS NOT NULL
                                AND is_deleted = 0
                                AND is_visible = 1
                                LIMIT 1
                        ) AS comments_highlight_count,
                        (
                            SELECT
                                COUNT(id)
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                                AND tpb = 1
                                AND metaId IS NOT NULL
                                AND is_deleted = 0
                                AND is_visible = 1
                                LIMIT 1
                        ) AS comments_tpb_count,
                        (
                            SELECT
                                COUNT(id)
                            FROM
                                qa_comments
                            WHERE
                                qa_comments.evaluationId = evaluations.id
                                AND ppu = 1
                                AND metaId IS NOT NULL
                                AND is_deleted = 0
                                AND is_visible = 1
                                LIMIT 1
                        ) AS comments_ppu_count,

                        (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL AND metaId IS
                        NOT NULL AND is_deleted = 0 AND is_visible = 1 AND crp_approved = 1) AS comments_accepted_count,


                        ( SELECT COUNT(id) FROM qa_comments_replies WHERE commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND approved_no_comment IS NULL	AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) AND is_deleted = 0 ) AS comments_replies_count,
                        (
                            SELECT title FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
                        ) AS title,
                        (
                            SELECT version FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
                        ) AS version,
                        crp.action_area AS crp_action_area,
                        (
                            SELECT result_code FROM ${viewName} ${viewName} WHERE ${viewName}.id = evaluations.indicator_view_id
                        ) AS result_code,
                        indicator_user.indicatorId,
                        (
                            SELECT
                            group_concat(DISTINCT users.username)
                            FROM
                                qa_evaluations_assessed_by_qa_users qea
                                LEFT JOIN qa_users users ON users.id = qea.qaUsersId
                            WHERE
                                qea.qaEvaluationsId = evaluations.id
                        ) comment_by,
                        (
                            SELECT
                                group_concat(DISTINCT users2.username)
                            FROM
                                qa_users users2
                                LEFT JOIN qa_comments comments2 ON evaluations.id = comments2.evaluationId
                            WHERE
                                users2.id = comments2.highlightById
                                AND comments2.cycleId = 2
                        ) assessed_r2,
                        ( SELECT kp.is_melia FROM qa_knowledge_product_data kp WHERE evaluations.indicator_view_id = kp.id ) AS is_melia,
                        ( SELECT kp.knowledge_product_type FROM qa_knowledge_product_data kp WHERE evaluations.indicator_view_id = kp.id ) AS knowledge_product_type
                    FROM
                        qa_evaluations evaluations
                    LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
                    LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
                    LEFT JOIN qa_indicator_user indicator_user ON indicator_user.indicatorId = indicators.id
                    LEFT JOIN qa_knowledge_product_data kp ON kp.id = evaluations.indicator_view_id
                    WHERE (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
                    AND evaluations.indicator_view_name = :view_name
                    AND indicator_user.userId = :user_Id
                    AND evaluations.phase_year = actual_phase_year()
                    GROUP BY
                        crp.crp_id,
                        evaluations.id,
                        indicator_user.indicatorId
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { user_Id: id, view_name: viewName },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getEvaluationsDashByCRP(crpId: string): Promise<any[]> {
    const sqlQuery = `
    SELECT
            evaluations.crp_id AS crp_id,
            evaluations.indicator_view_name AS indicator_view_name,
            indicator.primary_field AS primary_field,
            (
                    SELECT
                            enable_crp
                    FROM
                            qa_comments_meta comments_meta
                    WHERE
                            comments_meta.indicatorId = indicator.id
            ) AS indicator_status,
            indicator.order AS indicator_order,
            COUNT(DISTINCT evaluations.id) AS count,
            IF(
                    (
                            SELECT
                                    COUNT(id)
                            FROM
                                    qa_comments
                            WHERE
                                    qa_comments.evaluationId = evaluations.id
                                    AND approved_no_comment IS NULL
                                    AND metaId IS NOT NULL
                                    AND is_deleted = 0
                                    AND is_visible = 1
                                    AND detail IS NOT NULL
                                    AND cycleId = 1
                    ) <= (
                            SELECT
                                    COUNT(id)
                            FROM
                                    qa_comments_replies
                            WHERE
                                    is_deleted = 0
                                    AND commentId IN (
                                            SELECT
                                                    id
                                            FROM
                                                    qa_comments
                                            WHERE
                                                    qa_comments.evaluationId = evaluations.id
                                                    AND approved_no_comment IS NULL
                                                    AND metaId IS NOT NULL
                                                    AND is_deleted = 0
                                                    AND is_visible = 1
                                                    AND detail IS NOT NULL
                                                    AND cycleId = 1
                                    )
                    ),
                    "complete",
                    "pending"
            ) AS evaluations_status
    FROM
            qa_evaluations evaluations
            LEFT JOIN qa_indicators indicator ON indicator.view_name = evaluations.indicator_view_name
            LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
            AND crp.active = 1
            AND crp.qa_active = 'open'
    WHERE
            (
                    evaluations.evaluation_status <> 'Deleted'
                    OR evaluations.evaluation_status IS NULL
            )
            AND evaluations.crp_id = '${crpId}'
            AND evaluations.indicator_view_name <> 'qa_outcomes'
            AND evaluations.phase_year = actual_phase_year()
            AND evaluations.batchDate >= actual_batch_date()
    GROUP BY
            evaluations_status,
            evaluations.indicator_view_name,
            evaluations.crp_id,
            indicator_order,
            indicator.id,
            indicator.primary_field
    ORDER BY
            indicator.order ASC,
            evaluations_status DESC;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(sqlQuery, {}, {});
    return await queryRunner.connection.query(query, parameters);
  }

  async getAllEvaluationsDash(): Promise<any[]> {
    const sqlQuery = `
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
            AND (
                    evaluations.evaluation_status <> 'Deleted'
                    AND evaluations.evaluation_status <> 'Removed'
                    OR evaluations.evaluation_status IS NULL
                    AND evaluations.batchDate >= actual_batch_date()
            )
            LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
            AND crp.active = 1
            AND crp.qa_active = 'open'
    GROUP BY
            evaluations.status,
            indicator.view_name,
            indicator_order,
            indicator.primary_field
    ORDER BY
            indicator.order ASC,
            evaluations.status;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(sqlQuery, {}, {});
    return await queryRunner.connection.query(query, parameters);
  }

  async getEvaluationsDashByUserId(userId: number): Promise<any[]> {
    const sqlQuery = `
      SELECT
        evaluations.status AS status,
        meta.enable_crp,
        meta.enable_assessor,
        indicator.view_name AS indicator_view_name,
        indicator.primary_field AS primary_field,
        indicator.order AS indicator_order,
        COUNT(DISTINCT evaluations.id) AS count
      FROM
        qa_indicator_user qa_indicator_user
      LEFT JOIN qa_indicators indicator ON indicator.id = qa_indicator_user.indicatorId
      LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_name = indicator.view_name
        AND evaluations.phase_year = actual_phase_year()
        AND (
          evaluations.evaluation_status <> 'Deleted'
          AND evaluations.evaluation_status <> 'Removed'
          OR evaluations.evaluation_status IS NULL
        )
      LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
        AND crp.active = 1
        AND crp.qa_active = 'open'
      LEFT JOIN qa_comments_meta meta ON meta.indicatorId = indicator.id
      WHERE
        qa_indicator_user.userId = :userId
        AND evaluations.batchDate >= actual_batch_date()
      GROUP BY
        evaluations.status,
        indicator.view_name,
        meta.enable_crp,
        meta.enable_assessor,
        indicator.order,
        indicator.primary_field
      ORDER BY
        indicator_order ASC,
        evaluations.status;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { userId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getDetailedEvaluationForAdmin(
    userId: number,
    viewName: string,
    viewNamePsdo: string,
    indicatorId: number,
  ): Promise<any[]> {
    const sqlQuery = `
    SELECT
        ${viewNamePsdo}.*, 
        meta.enable_comments AS meta_enable_comments,
        meta.col_name AS meta_col_name,
        meta.display_name AS meta_display_name,
        meta.id AS meta_id,
        meta.order AS order_,
        meta.description AS meta_description,
        meta.include_detail AS meta_include_detail,
        meta.is_primay AS meta_is_primay,
        meta.is_core AS is_core,
        meta.indicator_slug AS indicator_slug,
        evaluations.id AS evaluation_id,
        evaluations.evaluation_status AS evaluation_status, 
        crp.name AS crp_name,
        crp.crp_id AS crp_acronym,
        (SELECT qc.original_field FROM qa_comments qc WHERE qc.evaluationId = evaluations.id and qc.metaId  = meta.id AND is_deleted = 0 AND qc.approved_no_comment IS NULL LIMIT 1) as original_field, evaluations.status AS evaluations_status,
        evaluations.require_second_assessment,
        IF(
            (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id  AND approved_no_comment IS NULL AND metaId IS NOT NULL AND detail IS NOT NULL AND is_deleted = 0 AND is_visible = 1) 
                = 
            ( SELECT COUNT(id) FROM qa_comments_replies WHERE is_deleted = 0 AND commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id  AND approved_no_comment IS NULL AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) ), "complete", "pending") 
        AS response_status,
    ( SELECT enable_assessor FROM qa_comments_meta WHERE indicatorId = indicators.id ) AS enable_assessor,
    ( SELECT highlight_comment FROM qa_comments WHERE evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 LIMIT 1) AS is_highlight,
    ( SELECT COUNT(id) FROM qa_comments WHERE require_changes = 1 AND evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 ) AS require_changes,
    ( SELECT id FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_deleted = 0 LIMIT 1 ) AS general_comment_id,
    ( SELECT detail FROM qa_comments WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment,
    ( SELECT user_.name FROM qa_users user_ LEFT JOIN qa_comments comments ON comments.highlightById = user_.id WHERE evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 LIMIT 1 ) AS highligth_by,
    ( SELECT user_.username FROM qa_comments comments LEFT JOIN qa_users user_ ON user_.id = comments.userId WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment_user,
    ( SELECT user_.updatedAt FROM qa_comments comments LEFT JOIN qa_users user_ ON user_.id = comments.userId WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment_updatedAt,
    ( SELECT approved_no_comment FROM qa_comments WHERE metaId = meta.id AND evaluationId = evaluations.id 	AND is_deleted = 0 AND approved_no_comment IS NOT NULL LIMIT 1) AS approved_no_comment,
    ( SELECT COUNT(id) FROM qa_comments_replies WHERE is_deleted = 0 AND commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND qa_comments.metaId = meta.id AND approved_no_comment IS NULL	AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) ) AS comments_replies_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL ) AS replies_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND approved_no_comment IS NULL AND tpb = 1 AND ppu = 1) AS tpb_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 1) AS accepted_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 2) AS disagree_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 3) AS clarification_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 4) AS accepted_with_comments
    FROM
        ${viewName} ${viewNamePsdo}
    LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_id = ${viewNamePsdo}.id
    LEFT JOIN qa_indicators indicators ON indicators.view_name = '${viewName}'
    LEFT JOIN qa_indicators_meta meta ON meta.indicatorId = indicators.id
    LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
    LEFT JOIN qa_comments qa ON qa.highlightById = evaluations.crp_id
    WHERE ${viewNamePsdo}.id = :indicatorId 
    AND evaluations.indicator_view_name = '${viewName}'
    AND evaluations.phase_year = actual_phase_year()
    ORDER BY meta.order ASC
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { user_Id: userId, indicatorId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getDetailedEvaluationForCrp(
    userId: number,
    viewName: string,
    viewNamePsdo: string,
    indicatorId: number,
  ): Promise<any[]> {
    const sqlQuery = `
    SELECT
        ${viewNamePsdo}.*, 
        meta.enable_comments AS meta_enable_comments,
        meta.col_name AS meta_col_name,
        meta.display_name AS meta_display_name,
        meta.id AS meta_id,
        meta.order AS order_,
        meta.is_core AS is_core,
        meta.indicator_slug AS indicator_slug,
        meta.description AS meta_description,
        meta.include_detail AS meta_include_detail,
        meta.is_primay AS meta_is_primay,
        evaluations.id AS evaluation_id,
        evaluations.evaluation_status AS evaluation_status,
        crp.name AS crp_name,
        crp.crp_id AS crp_acronym,
        (SELECT qc.original_field FROM qa_comments qc WHERE qc.evaluationId = evaluations.id and qc.metaId  = meta.id AND is_deleted = 0 AND qc.approved_no_comment IS NULL LIMIT 1) as original_field,
        evaluations.status AS evaluations_status,
        evaluations.require_second_assessment,
        IF(
            (SELECT COUNT(id) FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id  AND approved_no_comment IS NULL AND metaId IS NOT NULL AND detail IS NOT NULL AND is_deleted = 0 AND is_visible = 1) 
                = 
            ( SELECT COUNT(id) FROM qa_comments_replies WHERE is_deleted = 0 AND commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id  AND approved_no_comment IS NULL AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) ), "complete", "pending") 
        AS response_status,

    ( SELECT enable_crp FROM qa_comments_meta WHERE indicatorId = indicators.id ) AS enable_crp,
    ( SELECT id FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_deleted = 0 LIMIT 1 ) AS general_comment_id,
    ( SELECT highlight_comment FROM qa_comments WHERE evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 LIMIT 1) AS is_highlight,
    ( SELECT COUNT(id) FROM qa_comments WHERE require_changes = 1 AND evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 ) AS require_changes,
    ( SELECT user_.name FROM qa_users user_ LEFT JOIN qa_comments comments ON comments.highlightById = user_.id WHERE evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 LIMIT 1 ) AS highligth_by,
    ( SELECT detail FROM qa_comments WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment,
    ( SELECT user_.username FROM qa_comments comments LEFT JOIN qa_users user_ ON user_.id = comments.userId WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment_user,
    ( SELECT user_.updatedAt FROM qa_comments comments LEFT JOIN qa_users user_ ON user_.id = comments.userId WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment_updatedAt,
    ( SELECT approved_no_comment FROM qa_comments WHERE metaId = meta.id AND evaluationId = evaluations.id 	AND is_deleted = 0 AND approved_no_comment IS NOT NULL LIMIT 1) AS approved_no_comment,
    ( SELECT COUNT(id) FROM qa_comments_replies WHERE is_deleted = 0 AND commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND qa_comments.metaId = meta.id AND approved_no_comment IS NULL	AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) ) AS comments_replies_count,

    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND approved_no_comment IS NULL AND crp_approved = 1 ) AS crp_accepted,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND approved_no_comment IS NULL AND crp_approved = 0 ) AS crp_rejected,


    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND approved_no_comment IS NULL ) AS replies_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND approved_no_comment IS NULL AND tpb = 1 AND ppu = 1) AS tpb_count,
    
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 1) AS accepted_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 2) AS disagree_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 3) AS clarification_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 4) AS accepted_with_comments

    FROM
        ${viewName} ${viewNamePsdo}
    LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_id = ${viewNamePsdo}.id
    LEFT JOIN qa_indicators indicators ON indicators.view_name = '${viewName}'
    LEFT JOIN qa_indicators_meta meta ON meta.indicatorId = indicators.id
    LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
    WHERE ${viewNamePsdo}.id = :indicatorId 
    AND evaluations.indicator_view_name = '${viewName}'
    AND evaluations.phase_year = actual_phase_year()
    ORDER BY meta.order ASC
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { user_Id: userId, indicatorId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getDetailedEvaluationForUser(
    userId: number,
    viewName: string,
    viewNamePsdo: string,
    indicatorId: number,
  ): Promise<any[]> {
    console.log('🚀 ~ EvaluationRepository ~ viewNamePsdo:', viewNamePsdo);
    console.log('🚀 ~ EvaluationRepository ~ viewName:', viewName);
    const sqlQuery = `
    SELECT
        ${viewNamePsdo}.*, 
        meta.enable_comments AS meta_enable_comments,
        meta.col_name AS meta_col_name,
        meta.display_name AS meta_display_name,
        meta.id AS meta_id,
        meta.order AS order_,
        meta.description AS meta_description,
        meta.include_detail AS meta_include_detail,
        meta.is_primay AS meta_is_primay,
        meta.is_core AS is_core,
        meta.indicator_slug AS indicator_slug,
        evaluations.id AS evaluation_id,
        evaluations.evaluation_status AS evaluation_status,
        crp.name AS crp_name,
        crp.crp_id AS crp_acronym,
        (SELECT qc.original_field FROM qa_comments qc WHERE qc.evaluationId = evaluations.id and qc.metaId  = meta.id AND is_deleted = 0 AND qc.approved_no_comment IS NULL LIMIT 1) as original_field,
        evaluations.status AS evaluations_status,
        evaluations.require_second_assessment,
    ( SELECT enable_assessor FROM qa_comments_meta WHERE indicatorId = indicator_user.indicatorId ) AS enable_assessor,
    ( SELECT id FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_deleted = 0 LIMIT 1 ) AS general_comment_id,
    ( SELECT detail FROM qa_comments WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment,
    ( SELECT highlight_comment FROM qa_comments WHERE evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 LIMIT 1) AS is_highlight,
    ( SELECT COUNT(id) FROM qa_comments WHERE require_changes = 1 AND evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 ) AS require_changes,
    ( SELECT user_.name FROM qa_users user_ LEFT JOIN qa_comments comments ON comments.highlightById = user_.id WHERE evaluationId = evaluations.id AND metaId = meta.id AND is_deleted = 0 LIMIT 1 ) AS highligth_by,
    ( SELECT user_.username FROM qa_comments comments LEFT JOIN qa_users user_ ON user_.id = comments.userId WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment_user,
    ( SELECT user_.updatedAt FROM qa_comments comments LEFT JOIN qa_users user_ ON user_.id = comments.userId WHERE metaId IS NULL  AND evaluationId = evaluations.id  AND is_deleted = 0 AND approved_no_comment IS NULL LIMIT 1 ) AS general_comment_updatedAt,
    ( SELECT approved_no_comment FROM qa_comments WHERE metaId = meta.id AND evaluationId = evaluations.id 	AND is_deleted = 0 AND approved_no_comment IS NOT NULL LIMIT 1) AS approved_no_comment,
    ( SELECT COUNT(id) FROM qa_comments_replies WHERE is_deleted = 0 AND commentId IN (SELECT id FROM qa_comments WHERE qa_comments.evaluationId = evaluations.id AND qa_comments.metaId = meta.id AND approved_no_comment IS NULL	AND metaId IS NOT NULL AND is_deleted = 0 AND is_visible = 1) ) AS comments_replies_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL ) AS replies_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND approved_no_comment IS NULL AND tpb = 1 AND ppu = 1) AS tpb_count,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 1) AS accepted_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 2) AS disagree_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 3) AS clarification_comments,
    ( SELECT COUNT(DISTINCT id) FROM qa_comments WHERE metaId = meta.id  AND evaluationId = evaluations.id  AND is_visible = 1 AND is_deleted = 0 AND evaluationId = evaluations.id AND approved_no_comment IS NULL  AND replyTypeId = 4) AS accepted_with_comments

    FROM
        ${viewName} ${viewNamePsdo}
    LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_id = ${viewNamePsdo}.id
    LEFT JOIN qa_indicators indicators ON indicators.view_name = '${viewName}'
    LEFT JOIN qa_indicator_user indicator_user ON indicator_user.indicatorId = indicators.id
    LEFT JOIN qa_indicators_meta meta ON meta.indicatorId = indicators.id
    LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
    WHERE indicator_user.userId = :user_Id
    AND ${viewNamePsdo}.id = :indicatorId
    AND evaluations.indicator_view_name = '${viewName}'
    AND evaluations.phase_year = actual_phase_year()
    ORDER BY meta.order ASC
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { user_Id: userId, indicatorId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async findOneById(id: number): Promise<Evaluations | null> {
    return await this.findOne({ where: { id } });
  }

  async getMetaIdByViewName(viewName: string): Promise<any> {
    const sqlQuery = `
      SELECT id FROM qa_indicators_meta 
      WHERE indicatorId IN (
        SELECT id FROM qa_indicators WHERE view_name = :view_name
      ) 
      AND col_name = 'id';
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { view_name: viewName },
        {},
      );
    const result = await queryRunner.connection.query(query, parameters);
    return result[0]?.id || null;
  }

  async getIndicatorsByCrp(): Promise<any[]> {
    const sqlQuery = `
      SELECT
          indicators.id,
          meta.enable_assessor,
          meta.enable_crp,
          indicators.name AS indicator_view_name,
          indicators.order AS indicator_order
      FROM
          qa_indicators indicators
      LEFT JOIN qa_comments_meta meta ON indicators.id = meta.indicatorId
      WHERE
          indicators.is_active = 1
      GROUP BY
          indicators.id,
          indicator_order,
          meta.enable_assessor,
          meta.enable_crp,
          indicators.name
      ORDER BY
          indicators.order ASC;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(sqlQuery, {}, {});
    return await queryRunner.connection.query(query, parameters);
  }

  async createComment(
    detail: string,
    approved: boolean,
    userId: number,
    metaId: number | null,
    evaluationId: number,
    original_field: string | null,
    require_changes: boolean,
    tpb: boolean,
  ): Promise<Comments | null> {
    try {
      const userRepository = this.dataSource.getRepository(Users);
      const metaRepository = this.dataSource.getRepository(IndicatorsMeta);
      const commentRepository = this.dataSource.getRepository(Comments);
      const cycleRepository = this.dataSource.getRepository(Cycle);

      const user = await userRepository.findOneOrFail({
        where: { id: userId },
      });
      const meta = metaId
        ? await metaRepository.findOneOrFail({ where: { id: metaId } })
        : null;
      const evaluation = await this.findOneOrFail({
        where: { id: evaluationId },
      });

      const currentCycle = await cycleRepository
        .createQueryBuilder('qa_cycle')
        .where('DATE(qa_cycle.start_date) <= CURDATE()')
        .andWhere('DATE(qa_cycle.end_date) > CURDATE()')
        .getRawOne();

      if (!currentCycle) {
        throw new Error('Could not create comment: no active cycle found');
      }

      let comment_ = new Comments();
      comment_.detail = detail;
      comment_.approved = approved;
      comment_.meta = meta;
      comment_.evaluation = evaluation;
      comment_.user = user.id;
      comment_.cycle = currentCycle;
      comment_.require_changes = require_changes;
      comment_.tpb = tpb;
      if (original_field) comment_.original_field = original_field;
      let new_comment = await commentRepository.save(comment_);
    } catch (error) {
      return null;
    }
  }

  async findAssessorsR1(evaluationId: number): Promise<any[]> {
    const sqlQuery = `
      SELECT group_concat(DISTINCT users.username SEPARATOR ', ') AS assessed_r1
      FROM qa_evaluations_assessed_by_qa_users qea
      LEFT JOIN qa_users users ON users.id = qea.qaUsersId
      WHERE qea.qaEvaluationsId = :evaluationId;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { evaluationId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async findAssessorsR2(evaluationId: number): Promise<any[]> {
    const sqlQuery = `
      SELECT group_concat(DISTINCT users2.username SEPARATOR ', ') AS assessed_r2
      FROM qa_evaluations_assessed_by_second_round_qa_users qea2
      LEFT JOIN qa_users users2 ON users2.id = qea2.qaUsersId
      WHERE qea2.qaEvaluationsId = :evaluationId;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { evaluationId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async getPendingHighlights(): Promise<any[]> {
    const sqlQuery = `
      SELECT
        SUM(IF(comments.highlight_comment = 1 AND comments.is_deleted = 0, 1, 0)) AS pending_highlight_comments,
        SUM(IF(comments.tpb = 1 AND comments.is_deleted = 0, 1, 0)) AS total_tpb_comments,
        SUM(IF(comments.require_changes = 1 AND comments.is_deleted = 0, 1, 0)) AS solved_with_require_request,
        SUM(IF(comments.require_changes = 0 AND comments.tpb = 1 AND comments.is_deleted = 0, 1, 0)) AS solved_without_require_request,
        SUM(IF(comments.require_changes = 1 AND comments.ppu = 0 AND comments.is_deleted = 0, 1, 0)) AS pending_tpb_decisions,
        evaluations.indicator_view_name
      FROM
        qa_comments comments
      LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
      LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
      WHERE
        comments.is_deleted = 0
        AND comments.detail IS NOT NULL
        AND metaId IS NOT NULL
        AND evaluation_status <> 'Deleted'
        AND evaluations.phase_year = actual_phase_year()
        AND evaluations.batchDate >= actual_batch_date()
      GROUP BY
        evaluations.indicator_view_name;
    `;

    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(sqlQuery, {}, {});

    return await queryRunner.connection.query(query, parameters);
  }

  async getEvaluationStatus(resultId: string): Promise<any[]> {
    const sqlQuery = `
      SELECT
        evaluations.indicator_view_id,
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
              AND cycleId = 1
          ) = (
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
                  AND cycleId = 1
              )
          ),
          'complete',
          'pending'
        ) AS evaluations_status
      FROM qa_evaluations evaluations
      WHERE evaluations.indicator_view_id = :resultId;
    `;

    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] = queryRunner.connection.driver.escapeQueryWithParameters(
      sqlQuery,
      { resultId },
      {},
    );

    return await queryRunner.connection.query(query, parameters);
  }

  groupBy(array: any[], key: string) {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue,
      );
      return result;
    }, {});
  }

  getType(status: any, isCrp?: any) {
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

  parseEvaluationsData(rawData: any[], type?: string): any[] {
    let response = [];
    for (let index = 0; index < rawData.length; index++) {
      const dataItem = rawData[index];
      if (!type) {
        response.push(this.formatResponse(dataItem, type));
      } else if (!dataItem.meta_is_primary && dataItem.meta_include_detail) {
        response.push(this.formatResponse(dataItem, type));
      }
    }
    return response;
  }

  private formatResponse = (element: any, type: any) => {
    let field = element['meta_col_name'];
    let value = '';
    if (
      element[`${field}`] == '<Not applicable>' &&
      element['replies_count'] > 0
    ) {
      value = ' ';
    } else {
      value = element[`${field}`];
    }
    var response = {
      comments_replies_count: element['comments_replies_count'],
      comments_accepted_count: element['comments_accepted_count'],
      comments_accepted_with_comment_count:
        element['comments_accepted_with_comment_count'],
      comments_disagreed_count: element['comments_disagreed_count'],
      comments_clarification_count: element['comments_clarification_count'],
      comments_count: element['comments_count'],
      evaluation_id: element['evaluation_id'],
      is_core: element['is_core'],
      indicator_slug: element['indicator_slug'],
      status: element['evaluations_status'],
      response_status: element['response_status'],
      evaluation_status: element['evaluation_status'],
      indicator_view_id: element['indicator_view_id'],
      crp_name: element['crp_name'],
      short_name: element['short_name'],
      crp_accepted: element['crp_accepted'],
      crp_rejected: element['crp_rejected'],
      assessment_status: element['assessment_status'],
      require_second_assessment: element['require_second_assessment'],
      is_highlight: element['is_highlight'],
      highligth_by: element['highligth_by'],
      require_changes: element['require_changes'],
      comments_highlight_count: element['comments_highlight_count'],
      comments_tpb_count: element['comments_tpb_count'],
      comments_ppu_count: element['comments_ppu_count'],
      initiative: element['initiative'],
      tpb_count: element['tpb_count'],
      crp_acronym: element['crp_acronym'],
      is_melia: element['is_melia'],
      comments_highlight: element['comments_highlight'],
      pending_highlight_comments: element['pending_highlight_comments'],
      solved_with_require_request: element['solved_with_require_request'],
      solved_without_require_request: element['solved_without_require_request'],
      pending_tpb_decisions: element['pending_tpb_decisions'],
      knowledge_product_type: element['knowledge_product_type'],
      result_code: element['result_code'],
      crp_action_area: element['crp_action_area'],
      title: element['title'],
      version: element['version'],
      submission_date: moment(element['submission_date']).format('MMM D, YYYY'),
    };
    if (!type) {
      response = Object.assign(response, {
        indicator_view_name: element['indicator_view_name'],
        type: this.getType(element['evaluations_status']),
        id: element['indicator_view_id'],
        display_name: element['meta_display_name'],
        title: element['title'],
        version: element['version'],
        comment_by: element['comment_by'],
        assessed_r2: element['assessed_r2'],
        stage: element.hasOwnProperty('stage') ? element['stage'] : undefined,
        fp: element.hasOwnProperty('fp') ? element['fp'] : undefined,
        is_highlight: element['is_highlight'],
        highligth_by: element['highligth_by'],
        require_changes: element['require_changes'],
        comments_highlight_count: element['comments_highlight_count'],
        comments_tpb_count: element['comments_tpb_count'],
        comments_ppu_count: element['comments_ppu_count'],
        comments_disagreed_count: element['comments_disagreed_count'],
        initiative: element['initiative'],
        short_name: element['short_name'],
        crp_acronym: element['crp_acronym'],
        is_melia: element['is_melia'],
        comments_highlight: element['comments_highlight'],
        pending_highlight_comments: element['pending_highlight_comments'],
        solved_with_require_request: element['solved_with_require_request'],
        solved_without_require_request:
          element['solved_without_require_request'],
        pending_tpb_decisions: element['pending_tpb_decisions'],
        knowledge_product_type: element['knowledge_product_type'],
        indicator_slug: element['indicator_slug'],
        result_code: element['result_code'],
        indicator_view_id: element['indicator_view_id'],
        crp_action_area: element['crp_action_area'],
        submission_date: moment(element['submission_date']).format(
          'MMM D, YYYY',
        ),
      });
    } else {
      response = Object.assign(response, {
        enable_comments: element['meta_enable_comments'] === 1 ? true : false,
        col_name: element['meta_col_name'],
        display_name: element['meta_display_name'],
        display_type: DisplayTypeHandler.Paragraph,
        value: value,
        field_id: element['meta_id'],
        general_comment: element['general_comment'],
        general_comment_id: element['general_comment_id'],
        general_comment_user: element['general_comment_user'],
        general_comment_updatedAt: element['general_comment_updatedAt'],
        enable_assessor: element['enable_assessor'],
        enable_crp: element['enable_crp'],
        replies_count: element['replies_count'],
        tpb_count: element['tpb_count'],
        approved_no_comment: element['approved_no_comment'] || null,
        public_link: element[`public_link`],
        editable_link: element[`editable_link`],
        meta_description: element['meta_description'],
        comments_count: element['comments_count'],
        count_accepted_comments: element['accepted_comments'],
        count_disagree_comments: element['disagree_comments'],
        count_clarification_comments: element['clarification_comments'],
        count_accepted_with_comments: element['accepted_with_comments'],
        original_field: element['original_field'],
        hide_original_field: true,
        is_highlight: element['is_highlight'],
        highligth_by: element['highligth_by'],
        require_changes: element['require_changes'],
        comments_highlight_count: element['comments_highlight_count'],
        comments_tpb_count: element['comments_tpb_count'],
        comments_ppu_count: element['comments_ppu_count'],
        initiative: element['initiative'],
        short_name: element['short_name'],
        crp_acronym: element['crp_acronym'],
        is_melia: element['is_melia'],
        comments_highlight: element['comments_highlight'],
        pending_highlight_comments: element['pending_highlight_comments'],
        solved_with_require_request: element['solved_with_require_request'],
        solved_without_require_request:
          element['solved_without_require_request'],
        pending_tpb_decisions: element['pending_tpb_decisions'],
        knowledge_product_type: element['knowledge_product_type'],
        indicator_slug: element['indicator_slug'],
        result_code: element['result_code'],
        indicator_view_id: element['indicator_view_id'],
        crp_action_area: element['crp_action_area'],
        title: element['title'],
        version: element['version'],
        submission_date: moment(element['submission_date']).format(
          'MMM D, YYYY',
        ),
      });
    }

    return response;
  };
}
