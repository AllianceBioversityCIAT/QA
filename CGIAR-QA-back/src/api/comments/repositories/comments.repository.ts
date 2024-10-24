import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comments } from '../entities/comments.entity';
import { Users } from '../../users/entities/user.entity';
import { Evaluations } from '../../evaluations/entities/evaluation.entity';
import { Cycle } from '../../../shared/entities/cycle.entity';

@Injectable()
export class CommentsRepository extends Repository<Comments> {
  constructor(private readonly dataSource: DataSource) {
    super(Comments, dataSource.createEntityManager());
  }

  async getCommentsCount(crpId: string, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    let rawData: any[];

    try {
      const sql =
        crpId !== undefined && crpId !== 'undefined'
          ? `SELECT
              SUM(
                  IF (
                      comments.replyTypeId = 1
                      AND replies.detail = '',
                      1,
                      0
                  )
              ) AS comments_accepted_without_comment,
              /* Otras columnas calculadas */
              evaluations.indicator_view_name
            FROM
              qa_comments comments
              LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
              AND evaluations.crp_id = :crp_id
              LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
              AND replies.is_deleted = 0
            WHERE
              comments.is_deleted = 0
              AND comments.detail IS NOT NULL
              /* Filtros adicionales */
            GROUP BY
              evaluations.indicator_view_name,
              comments.replyTypeId
            ORDER BY
              type DESC;`
          : `SELECT
              SUM(
                  IF(
                      comments.replyTypeId = 1
                      AND replies.detail = '',
                      1,
                      0
                  )
              ) AS comments_accepted_without_comment,
              /* Otras columnas calculadas */
              evaluations.indicator_view_name
            FROM
              qa_comments comments
              LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
              LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
              AND replies.is_deleted = 0
            WHERE
              comments.is_deleted = 0
              AND comments.detail IS NOT NULL
              /* Filtros adicionales */
            GROUP BY
              evaluations.indicator_view_name,
              comments.replyTypeId
            ORDER BY
              type DESC;`;

      const [query, parameters] =
        queryRunner.connection.driver.escapeQueryWithParameters(
          sql,
          { crp_id: crpId },
          {},
        );
      rawData = await queryRunner.connection.query(query, parameters);

      return this.groupByIndicatorViewName(rawData);
    } catch (error) {
      throw new Error('Error retrieving comments count');
    } finally {
      await queryRunner.release();
    }
  }

  async getCommentsByCrpId(crpId: string): Promise<any[]> {
    const sqlQuery = `
    SELECT
      SUM(
          IF (
              comments.replyTypeId = 1
              AND replies.detail = '',
              1,
              0
          )
      ) AS comments_accepted_without_comment,
      SUM(
          IF (
              comments.replyTypeId = 4
              AND replies.detail <> '',
              1,
              0
          )
      ) AS comments_accepted_with_comment,
      SUM(
          IF (comments.replyTypeId = 2, 1, 0)
      ) AS comments_rejected,
      SUM(
          IF (comments.replyTypeId = 3, 1, 0)
      ) AS comments_clarification,
      SUM(
          IF (comments.replyTypeId = 5, 1, 0)
      ) AS comments_discarded,
      SUM(
          IF (
              comments.replyTypeId IS NULL
              AND comments.tpb = 0
              AND comments.cycleId = 1,
              1,
              0
          )
      ) AS comments_without_answer,
      SUM(
          IF (
              comments.require_changes = 1
              AND comments.tpb = 1
              AND comments.ppu = 0,
              1,
              0
          )
      ) AS comments_tpb_count,
      SUM(
          IF (
              comments.highlight_comment = 1,
              1,
              0
          )
      ) AS comments_highlight,
      SUM(
          IF(
              comments.highlight_comment = 1
              AND comments.ppu = 0,
              1,
              0
          )
      ) AS pending_highlight_comments,
      SUM(
          IF(
              comments.highlight_comment = 1
              AND comments.require_changes = 1
              AND comments.ppu = 1,
              1,
              0
          )
      ) AS solved_with_require_request,
      SUM(
          IF(
              comments.highlight_comment = 1
              AND comments.require_changes = 0
              AND comments.ppu = 1,
              1,
              0
          )
      ) AS solved_without_require_request,
      SUM(
          IF(
              comments.tpb = 1
              AND comments.require_changes = 1
              AND comments.ppu = 0
              AND comments.is_deleted = 0,
              1,
              0
          )
      ) AS pending_tpb_decisions,
      SUM(IF(replies.userId = 47, 1, 0)) AS auto_replies_total,
      IF(
          comments.replyTypeId IS NULL,
          'secondary',
          IF(comments.replyTypeId in(1, 4), 'success', 'danger')
      ) AS type,
      COUNT(DISTINCT comments.id) AS 'label',
      COUNT(DISTINCT comments.id) AS 'value',
      evaluations.indicator_view_name
  FROM
      qa_comments comments
      LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
      AND evaluations.crp_id = ?
      LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
      AND replies.is_deleted = 0
  WHERE
      comments.is_deleted = 0
      AND comments.detail IS NOT NULL
      AND metaId IS NOT NULL
      AND evaluation_status <> 'Deleted'
      AND evaluations.phase_year = actual_phase_year()
      AND evaluations.batchDate >= actual_batch_date()
      AND comments.cycleId IN (
          SELECT
              id
          FROM
              qa_cycle
          WHERE
              DATE(start_date) <= CURDATE()
              AND DATE(end_date) > CURDATE()
      )
  GROUP BY
      evaluations.indicator_view_name,
      comments.replyTypeId
  ORDER BY
      type DESC;
    `;

    return this.dataSource.query(sqlQuery, [crpId]);
  }

  async getAllComments(): Promise<any[]> {
    const sqlQuery = `
      SELECT
        SUM(
            IF(
                comments.replyTypeId = 1
                AND replies.detail = '',
                1,
                0
            )
        ) AS comments_accepted_without_comment,
        SUM(
            IF(
                comments.replyTypeId = 4
                AND replies.detail <> '',
                1,
                0
            )
        ) AS comments_accepted_with_comment,
        SUM(IF(comments.replyTypeId = 2, 1, 0)) AS comments_rejected,
        SUM(IF(comments.replyTypeId = 3, 1, 0)) AS comments_clarification,
        SUM(IF(comments.replyTypeId = 5, 1, 0)) AS comments_discarded,
        SUM(
            IF (
                comments.replyTypeId IS NULL 
                AND comments.tpb = 0
                AND comments.cycleId = 1,
                1,
                0
            )
        ) AS comments_without_answer,
        SUM(
            IF(
                comments.require_changes = 1
                AND comments.tpb = 1
                AND comments.ppu = 0,
                1,
                0
            )
        ) AS comments_tpb_count,
        SUM(
            IF(
                comments.tpb = 1,
                1,
                0
            )
        ) AS comments_highlight,
        SUM(IF(replies.userId = 47, 1, 0)) AS auto_replies_total,
        SUM(
            IF(
                comments.highlight_comment = 1
                AND comments.ppu = 0,
                1,
                0
            )
        ) AS pending_highlight_comments,
        SUM(
            IF(
                comments.highlight_comment = 1
                AND comments.require_changes = 1
                AND comments.ppu = 1,
                1,
                0
            )
        ) AS solved_with_require_request,
        SUM(
            IF(
                comments.highlight_comment = 1
                AND comments.require_changes = 0
                AND comments.ppu = 1,
                1,
                0
            )
        ) AS solved_without_require_request,
        SUM(
            IF(
                comments.highlight_comment = 1
                AND comments.require_changes = 1
                AND comments.ppu = 0,
                1,
                0
            )
        ) AS pending_tpb_decisions,
        IF(
            comments.replyTypeId IS NULL,
            'secondary',
            IF(
                comments.replyTypeId in (1, 4),
                'success',
                'danger'
            )
        ) AS type,
        COUNT(DISTINCT comments.id) AS 'label',
        COUNT(DISTINCT comments.id) AS 'value',
        evaluations.indicator_view_name
    FROM
        qa_comments comments
        LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
        LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
        AND replies.is_deleted = 0
    WHERE
        comments.is_deleted = 0
        AND comments.detail IS NOT NULL
        AND metaId IS NOT NULL
        AND evaluation_status <> 'Deleted'
        AND evaluations.phase_year = actual_phase_year()
        AND evaluations.batchDate >= actual_batch_date()
        AND comments.cycleId = 1
    GROUP BY
        evaluations.indicator_view_name,
        comments.replyTypeId
    ORDER BY
        type DESC;
    `;

    return this.dataSource.query(sqlQuery);
  }

  groupByIndicatorViewName(data: any[]) {
    return data.reduce((result, item) => {
      const key = item.indicator_view_name;
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    }, {});
  }

  async fetchCommentsByCRP(crp_id: string, indicatorName: string) {
    const query = `
      SELECT
        comments.detail, comments.id AS comment_id, evaluations.indicator_view_id AS id,
        comments.updatedAt, comments.createdAt, comments.crp_approved, evaluations.crp_id,
        evaluations.id AS evaluation_id, users.username, meta.display_name, meta.col_name,
        replies.createdAt AS reply_createdAt, replies.updatedAt AS reply_updatedAt, replies.detail AS reply,
        (SELECT title FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS indicator_title,
        (SELECT result_code FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS result_code,
        (SELECT username FROM qa_users WHERE id = replies.userId) AS reply_user,
        (SELECT cycle_stage FROM qa_cycle WHERE id = comments.cycleId) AS cycle_stage
      FROM qa_comments comments
      LEFT JOIN qa_users users ON users.id = comments.userId
      LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
      LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
      LEFT JOIN qa_indicators_meta meta ON meta.id = comments.metaId
      WHERE comments.detail IS NOT NULL
        AND evaluations.indicator_view_name = :indicatorName
        AND (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
        AND comments.approved = 1
        AND comments.is_deleted = 0
        AND evaluations.crp_id = :crp_id
        AND evaluations.phase_year = actual_phase_year()
      ORDER BY createdAt ASC`;

    return await this.query(query, [crp_id, indicatorName]);
  }

  async fetchCommentsByEvaluation(
    evaluationId: string,
    currentRole: string,
    indicatorName: string,
  ) {
    const query = `
      SELECT
        evaluations.crp_id AS 'Init short name', qcd.result_code AS 'Result code',
        (SELECT title FROM ${indicatorName}_data WHERE id = evaluations.indicator_view_id) AS 'Result title',
        evaluations.phase_year AS 'Year', evaluations.id AS 'Evaluation ID',
        meta.display_name AS 'Field name', clean_html_tags(comments.original_field) AS 'Field value 2023',
        clean_html_tags(comments.detail) AS 'Comment 2023', comments.createdAt AS 'Created date',
        users.username AS 'Assessor username', users.email AS 'Assessor email',
        (SELECT qrt.name FROM qa_reply_type qrt WHERE qrt.id = comments.replyTypeId) AS 'Init reply type',
        replies.detail AS 'Init reply', replies.createdAt AS 'Reply created date',
        (SELECT username FROM qa_users WHERE id = replies.userId) AS 'Init user',
        (SELECT cycle_stage FROM qa_cycle WHERE id = comments.cycleId) as 'Round'
      FROM qa_comments comments
      LEFT JOIN qa_users users ON users.id = comments.userId
      LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
      LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
      LEFT JOIN qa_indicators_meta meta ON meta.id = comments.metaId
      LEFT JOIN ${indicatorName}_data qcd ON qcd.id = evaluations.indicator_view_id
      WHERE comments.detail IS NOT NULL
        AND qcd.result_code IN (
          SELECT qcd2.result_code FROM ${indicatorName} qcd2
          JOIN qa_evaluations qe ON qe.indicator_view_id = qcd2.id
          WHERE qe.indicator_view_id = qcd2.id AND qe.id = :evaluationId
        )
        AND (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
        AND comments.approved = 1
        AND comments.is_visible = 1
        AND comments.is_deleted = 0
        AND comments.approved_no_comment IS NULL
      GROUP BY evaluations.phase_year, comments.detail, comments.id,
        replies.createdAt, replies.updatedAt, replies.detail, replies.userId
      ORDER BY evaluations.phase_year ASC, comments.createdAt ASC`;

    return await this.query(query, [evaluationId]);
  }

  async findCommentsWithMeta(evaluationId: number, meta_array: number[]) {
    return await this.createQueryBuilder('qc')
      .leftJoinAndSelect('qc.meta', 'meta')
      .where('qc.evaluationId = :evaluationId', { evaluationId })
      .andWhere('qc.metaId IN (:...meta_array)', { meta_array })
      .andWhere('qc.approved_no_comment IS NOT NULL')
      .getMany();
  }

  createComment(
    user: Users,
    evaluation: Evaluations,
    metaId: number,
    noComment: boolean,
    cycle: Cycle,
  ) {
    const comment = new Comments();
    comment.approved = noComment;
    comment.is_deleted = !noComment;
    comment.evaluation = evaluation;
    comment.meta = { id: metaId } as any;
    comment.detail = null;
    comment.approved_no_comment = noComment;
    comment.user = user.id;
    comment.cycle = cycle;
    return comment;
  }

  async getRawCommentsExcel(crp_id: string): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const commentsQuery = `
        SELECT
            evaluations.crp_id AS 'Initiative ID',
            (
                SELECT action_area FROM qa_crp WHERE crp_id = evaluations.crp_id
            ) AS 'Action area',
            CASE
                comments.replyTypeId
                WHEN 1 THEN 'Accepted'
                WHEN 2 THEN 'Disagree'
                WHEN 3 THEN 'Clarification'
                WHEN 4 THEN 'Accepted with comment'
                WHEN 5 THEN 'Discarded'
                ELSE 'Pending'
            END AS 'Status',
            CASE evaluations.indicator_view_name
                WHEN 'qa_other_output' THEN qood2.result_code
                WHEN 'qa_innovation_development' THEN qidd.result_code
                WHEN 'qa_knowledge_product' THEN qkp.result_code
                WHEN 'qa_capdev' THEN qcd.result_code
                WHEN 'qa_impact_contribution' THEN qicd.result_code
                WHEN 'qa_other_outcome' THEN qood.result_code
                WHEN 'qa_innovation_use' THEN qiud.result_code
                WHEN 'qa_policy_change' THEN qpcd.result_code
                WHEN 'qa_innovation_use_ipsr' THEN qiuid.result_code
                ELSE NULL
            END AS 'Result Code',
            comments.id AS 'Comment ID',
            (
                SELECT name FROM qa_indicators WHERE view_name = evaluations.indicator_view_name
            ) AS 'Indicator type',
            (
                SELECT display_name FROM qa_indicators_meta WHERE id = comments.metaId
            ) AS 'Field',
            clean_html_tags(comments.original_field) AS 'Original field',
            IF(qim.is_core = 1, 'Yes', 'No') AS 'Is core',
            comments.detail AS 'Assessor comment',
            comments.createdAt AS 'Comment created at',
            comments.id AS 'Comment ID',
            (
                SELECT username FROM qa_users WHERE id = comments.userId
            ) as 'Assessor',
            (
                SELECT cycle_stage FROM qa_cycle WHERE id = comments.cycleId
            ) as 'Round',
            IFNULL(
                (SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id AND is_deleted = 0),
                '<not replied>'
            ) as 'Reply',
            IFNULL(
                (SELECT GROUP_CONCAT(username SEPARATOR '\n') FROM qa_users WHERE id = replies.userId AND replies.is_deleted = 0),
                '<not replied>'
            ) AS 'User reply',
            IF(comments.highlight_comment = 1, 'Yes', 'No') AS 'Highlight comment',
            IF(comments.require_changes = 1, 'Yes', 'No') AS 'Require changes comment',
            IF(comments.tpb = 1, 'Yes', 'No') AS 'TPB Instruction',
            IF(comments.ppu = 1, 'Yes', 'No') AS 'Implemented changes',
            IFNULL(
                (SELECT GROUP_CONCAT(createdAt SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id AND is_deleted = 0),
                '<not replied>'
            ) AS 'Reply date'
        FROM
            qa_comments comments
            LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
            AND evaluations.status <> 'Deleted'
            LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
            AND replies.is_deleted = 0
            LEFT JOIN qa_cycle qc ON qc.id = comments.cycleId
            LEFT JOIN qa_indicators_meta qim ON qim.id = comments.metaId
        WHERE
            comments.is_deleted = 0
            AND comments.detail IS NOT NULL
            AND evaluations.phase_year = actual_phase_year()
            AND evaluations.batchDate >= actual_batch_date()
            AND evaluations.crp_id = ?
        GROUP BY evaluations.crp_id, 'display_name', 'cycle_stage', comments.id
        ORDER BY evaluations.crp_id, indicator_view_id;`;

      const evaluationQuery = `
        SELECT
            evaluations.crp_id AS 'Initiative ID',
            (
                SELECT name FROM qa_indicators WHERE view_name = evaluations.indicator_view_name
            ) AS 'Indicator type',
            evaluations.evaluation_status AS 'Result status',
            IFNULL (
                (SELECT GROUP_CONCAT(DISTINCT qu.name SEPARATOR '\n') FROM qa_comments qc LEFT JOIN qa_users qu ON qu.id = qc.userId WHERE qc.evaluationId = evaluations.id AND qc.is_deleted = 0),
                '~'
            ) AS 'Assessed by',
            (
                SELECT title FROM qa_data WHERE id = evaluations.indicator_view_id
            ) AS 'Result title'
        FROM qa_evaluations evaluations
        WHERE evaluations.phase_year = actual_phase_year()
        AND evaluations.crp_id = ?
        AND evaluations.batchDate >= actual_batch_date()
        ORDER BY evaluations.crp_id ASC;`;

      const commentsData = await queryRunner.query(commentsQuery, [crp_id]);
      const evaluationData = await queryRunner.query(evaluationQuery, [crp_id]);

      return [commentsData, evaluationData];
    } finally {
      await queryRunner.release();
    }
  }

  async getRawCommentsData(crp_id?: string): Promise<any[]> {
    const query = `
      SELECT
        (SELECT acronym FROM qa_crp WHERE crp_id = evaluations.crp_id) AS crp_acronym,
        evaluations.indicator_view_id AS indicator_view_id,
        (SELECT name FROM qa_indicators WHERE id IN (SELECT indicatorId FROM qa_indicators_meta WHERE id = comments.metaId)) AS indicator_view_display,
        (SELECT view_name FROM qa_indicators WHERE id IN (SELECT indicatorId FROM qa_indicators_meta WHERE id = comments.metaId)) AS indicator_view_name,
        (SELECT display_name FROM qa_indicators_meta WHERE id = comments.metaId) AS field_name,
        comments.id AS comment_id,
        (SELECT username FROM qa_users WHERE id = comments.userId) AS assessor_username,
        comments.detail AS comment_detail,
        (SELECT GROUP_CONCAT(detail) FROM qa_comments_replies WHERE commentId = comments.id) AS crp_comment,
        SUM(IF(replies.userId = 47, 1, 0)) AS comment_auto_replied,
        (SELECT cycle_stage FROM qa_cycle WHERE id = comments.cycleId) AS cycle,
        IF(comments.crp_approved IS NULL, 'Pending', IF(comments.crp_approved = 1, 'Approved', 'Rejected')) AS reply_status,
        SUM(IF(comments.crp_approved = 1, 1, 0)) AS comment_approved,
        SUM(IF(comments.crp_approved = 0, 1, 0)) AS comment_rejected,
        SUM(IF(comments.crp_approved IS NULL, 1, 0)) AS comment_no_answer
      FROM qa_comments comments
      LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId ${
        crp_id ? 'AND evaluations.crp_id = :crp_id' : ''
      } AND evaluations.status <> 'Deleted'
      LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
      WHERE
        comments.is_deleted = 0
        AND comments.detail IS NOT NULL
        AND metaId IS NOT NULL
        AND evaluation_status <> 'Deleted'
      GROUP BY
        evaluations.crp_id,
        field_name,
        cycle,
        comments.id
      ORDER BY
        evaluations.crp_id,
        indicator_view_id;
    `;

    const params = crp_id ? [crp_id] : [];

    return await this.query(query, params);
  }

  async findOneById(id: number): Promise<Comments | null> {
    return await this.findOne({ where: { id } });
  }

  async findCommentById(commentReplyId: number) {
    return await this.findOneOrFail({ where: { id: commentReplyId } });
  }

  async saveComment(comment: Comments) {
    return await this.save(comment);
  }

  async getExcelComments(crp_id: string) {
    try {
      const query = `
        SELECT
          evaluations.crp_id AS 'Initiative ID',
        CASE
              comments.replyTypeId
              WHEN 1 THEN 'Accepted'
              WHEN 2 THEN 'Disagree'
              WHEN 3 THEN 'Clarification'
              WHEN 4 THEN 'Accepted with comment'
              WHEN 5 THEN 'Discarded'
              ELSE 'Pending'
          END AS 'Status',
        CASE
              evaluations.indicator_view_name
              WHEN 'qa_other_output' THEN qood2.result_code
              WHEN 'qa_innovation_development' THEN qidd.result_code
              WHEN 'qa_knowledge_product' THEN qkp.result_code
              WHEN 'qa_capdev' THEN qcd.result_code
              WHEN 'qa_impact_contribution' THEN qicd.result_code
              WHEN 'qa_other_outcome' THEN qood.result_code
              WHEN 'qa_innovation_use' THEN qiud.result_code
              WHEN 'qa_policy_change' THEN qpcd.result_code
              WHEN 'qa_innovation_use_ipsr' THEN qiuid.result_code
              ELSE NULL
          END AS 'Result Code',
          comments.id AS 'Comment ID',
          (
              SELECT
                  name
              FROM
                  qa_indicators
              WHERE
                  view_name = evaluations.indicator_view_name
          ) AS 'Indicator type',
          (
              SELECT
                  display_name
              FROM
                  qa_indicators_meta
              WHERE
                  id = comments.metaId
          ) AS 'Field',
          clean_html_tags(comments.original_field) AS 'Original field',
          CASE
              evaluations.indicator_view_name
              WHEN 'qa_other_output' THEN qood2.result_code
              WHEN 'qa_innovation_development' THEN qidd.result_code
              WHEN 'qa_knowledge_product' THEN qkp.result_code
              WHEN 'qa_capdev' THEN qcd.result_code
              WHEN 'qa_impact_contribution' THEN qicd.result_code
              WHEN 'qa_other_outcome' THEN qood.result_code
              WHEN 'qa_innovation_use' THEN qiud.result_code
              WHEN 'qa_policy_change' THEN qpcd.result_code
              WHEN 'qa_innovation_use_ipsr' THEN qiuid.result_code
              ELSE NULL
          END AS 'Result Code',
          IF(qim.is_core = 1, 'Yes', 'No') AS 'Is core',
          comments.detail AS 'Assessor comment',
          comments.createdAt AS 'Comment created at',
          comments.id AS 'Comment ID',
          (
              SELECT
                  username
              FROM
                  qa_users
              WHERE
                  id = comments.userId
          ) as 'Assessor',
          (
              SELECT
                  cycle_stage
              from
                  qa_cycle
              WHERE
                  id = comments.cycleId
          ) as 'Round',
          IFNULL(
              (
                  SELECT
                      GROUP_CONCAT(detail SEPARATOR '\n')
                  FROM
                      qa_comments_replies
                  WHERE
                      commentId = comments.id
                      and qa_comments_replies.is_deleted = 0
              ),
              '<not replied>'
          ) as 'Reply',
          IFNULL(
              (
                  SELECT
                      GROUP_CONCAT(
                          (
                              SELECT
                                  username
                              from
                                  qa_users
                              WHERE
                                  id = userId
                          ) SEPARATOR '\n'
                      )
                  FROM
                      qa_comments_replies
                  WHERE
                      commentId = comments.id
                      and qa_comments_replies.is_deleted = 0
              ),
              '<not replied>'
          ) AS 'User reply',
          (
              CASE
                  WHEN qrt.id = 1 THEN 'Accepted'
                  WHEN qrt.id = 2 THEN 'Disagreed'
                  WHEN qrt.id = 4 THEN 'Accepted with comments'
                  ELSE 'Pending'
              END
          ) AS 'Reply status',
          IF(comments.highlight_comment = 1, 'Yes', 'No') AS 'Highligth comment',
          IF(comments.require_changes = 1, 'Yes', 'No') AS 'Require changes comment',
          IF(comments.tpb = 1, 'Yes', 'No') AS 'TPB Instruction',
          IF(comments.ppu = 1, 'Yes', 'No') AS 'Implemented changes',
          IFNULL(
              (
                  SELECT
                      GROUP_CONCAT(createdAt SEPARATOR '\n')
                  FROM
                      qa_comments_replies
                  WHERE
                      commentId = comments.id
                      and qa_comments_replies.is_deleted = 0
              ),
              '<not replied>'
          ) AS 'Reply date'
      FROM
          qa_comments comments
          LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
          AND evaluations.status <> 'Deleted'
          LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
          AND replies.is_deleted = 0
          LEFT JOIN qa_cycle qc ON qc.id = comments.cycleId
          LEFT JOIN qa_indicators_meta qim ON qim.id = comments.metaId
          LEFT JOIN qa_reply_type qrt ON qrt.id = comments.replyTypeId
          LEFT JOIN qa_innovation_use_data qiud ON qiud.id = evaluations.indicator_view_id
          LEFT JOIN qa_innovation_development_data qidd ON qidd.id = evaluations.indicator_view_id
          LEFT JOIN qa_knowledge_product qkp ON qkp.id = evaluations.indicator_view_id
          LEFT JOIN qa_capdev_data qcd ON qcd.id = evaluations.indicator_view_id
          LEFT JOIN qa_impact_contribution_data qicd ON qicd.id = evaluations.indicator_view_id
          LEFT JOIN qa_other_outcome_data qood ON qood.id = evaluations.indicator_view_id
          LEFT JOIN qa_other_output_data qood2 ON qood2.id = evaluations.indicator_view_id
          LEFT JOIN qa_policy_change_data qpcd ON qpcd.id = evaluations.indicator_view_id
          LEFT JOIN qa_innovation_use_ipsr_data qiuid ON qiuid.id = evaluations.indicator_view_id
      WHERE
          comments.is_deleted = 0
          AND comments.detail IS NOT NULL
          AND evaluations.phase_year = actual_phase_year()
          AND evaluations.batchDate >= actual_batch_date()
          AND evaluations.crp_id = ?
      GROUP BY
          evaluations.crp_id,
          'display_name',
          'cycle_stage',
          comments.id
      ORDER BY
          evaluations.crp_id,
          indicator_view_id;      
      `;
      return await this.query(query, [crp_id]);
    } catch (error) {
      throw new Error('Error retrieving comments');
    }
  }

  async findOneWithTags(id: number): Promise<Comments | null> {
    return await this.findOne({
      where: { id },
      relations: {
        tags: true,
      },
    });
  }

  async findCommentsWithReplies(
    evaluationId: number,
    metaId: number,
  ): Promise<any[]> {
    const sqlQuery = `
      SELECT
        id,
        (
          SELECT COUNT(DISTINCT id)
          FROM qa_comments_replies
          WHERE commentId = qa_comments.id AND is_deleted = 0
        ) AS replies_count,
        (
          SELECT qu.username
          FROM qa_users qu
          WHERE qa_comments.highlightById = qu.id
        ) AS highlight_by,
        highlight_comment,
        highlightById
      FROM qa_comments
      WHERE metaId = :metaId AND evaluationId = :evaluationId
        AND approved_no_comment IS NULL;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { metaId, evaluationId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }

  async findTagsByCommentId(commentId: number): Promise<any[]> {
    const sqlQuery = `
      SELECT 
        tag.id AS tag_id, tt.id AS tag_type, tt.name AS tag_name,
        us.name AS user_name, us.id AS userId
      FROM qa_tags tag
      JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      JOIN qa_users us ON us.id = tag.userId
      WHERE tag.commentId = :commentId;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { commentId },
        {},
      );
    return await queryRunner.connection.query(query, parameters);
  }
}
