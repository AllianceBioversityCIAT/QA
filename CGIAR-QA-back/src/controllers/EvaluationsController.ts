import { Request, Response } from "express";
import { getRepository, getConnection, getManager } from "typeorm";

import { QACrp } from "./../entity/CRP";
import { QAEvaluations } from "./../entity/Evaluations";
import { QAUsers } from "./../entity/User";

import { RolesHandler } from "./../_helpers/RolesHandler";
import Util from "./../_helpers/Util";
import { StatusHandler } from "./../_helpers/StatusHandler";

class EvaluationsController {
  /**
   *
   * Evaluations CRUD
   *
   */

  // get evaluations dashboard by user
  static getEvaluationsDash = async (req: Request, res: Response) => {
    const id = req.params.id;
    let queryRunner = getConnection().createQueryBuilder();

    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
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
                    qa_indicator_user.userId = :user_Id
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
                    evaluations.status
                `,
          { user_Id: id },
          {}
        );

      let rawData = await queryRunner.connection.query(query, parameters);

      if (rawData.length === 0) {
        return res
          .status(200)
          .json({ data: [], message: "No evaluations found for the user." });
      }

      let response = [];
      for (let index = 0; index < rawData.length; index++) {
        const element = rawData[index];
        response.push({
          indicator_view_name: element["indicator_view_name"],
          status: element["status"],
          indicator_status: element["enable_assessor"],
          type: Util.getType(element["status"]),
          value: element["count"],
          label: `${element["count"]}`,
          primary_field: element["primary_field"],
          order: element["indicator_order"],
        });
      }

      let result = Util.groupBy(response, "indicator_view_name");
      res.status(200).json({ data: result, message: "User evaluations" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "User evaluations Could not access to evaluations." });
    }
  };

  // get all evaluations dashboard - ADMIN DASHBOARD
  static getAllEvaluationsDash = async (req: Request, res: Response) => {
    let { crp_id } = req.query;
    const userId = res.locals.jwtPayload.userId;
    let queryRunner = getConnection().createQueryBuilder();
    const userRepository = getRepository(QAUsers);

    try {
      let user = await userRepository.findOneOrFail(userId);

      let rawData;
      if (crp_id !== undefined && crp_id !== "undefined") {
        let sqlQuery = "";

        if (user.roles[0].description === RolesHandler.admin) {
          // CRP DEFINED && ADMIN
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
                AND evaluations.crp_id = '${crp_id}'
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
                        evaluations_status DESC
                `;
        }

        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            sqlQuery,
            {},
            {}
          );

        rawData = await queryRunner.connection.query(query, parameters);
      } else {
        // CRP UNDEFINED
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT
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
                WHERE
                    evaluations.batchDate >= actual_batch_date()
                GROUP BY
                    evaluations.status,
                    indicator.view_name,
                    indicator_order,
                    indicator.primary_field
                ORDER BY
                    indicator.order ASC,
                    evaluations.status `,
            {},
            {}
          );

        rawData = await queryRunner.connection.query(query, parameters);
      }

      let response = [];

      for (let index = 0; index < rawData.length; index++) {
        const element = rawData[index];
        response.push({
          indicator_view_name: element["indicator_view_name"],
          status: element["status"]
            ? element["status"]
            : element["evaluations_status"],
          type: Util.getType(
            element["status"]
              ? element["status"]
              : element["evaluations_status"],
            crp_id !== undefined && crp_id !== "undefined"
          ),
          value: element["count"],
          indicator_status: element["indicator_status"],
          crp_id: crp_id ? element["crp_id"] : null,
          label: `${element["count"]}`,
          primary_field: element["primary_field"],
          order: element["indicator_order"],
          tpb_count: element["tpb_count"],
        });
      }
      let result = Util.groupBy(response, "indicator_view_name");
      // res.status(200).json({ data: rawData, message: "All evaluations" });
      res.status(200).json({ data: result, message: "All evaluations" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "All evaluations could not access to evaluations." });
    }
  };
  // get all evaluations dashboard - ADMIN DASHBOARD
  static getAllEvaluationsDashByCRP = async (req: Request, res: Response) => {
    let { crp_id } = req.query;
    const userId = res.locals.jwtPayload.userId;
    let queryRunner = getConnection().createQueryBuilder();
    const userRepository = getRepository(QAUsers);

    try {
      let user = await userRepository.findOneOrFail(userId);

      let rawData;
      if (crp_id !== undefined && crp_id !== "undefined") {
        let sqlQuery = "";
        // In this query evaluation.status depends on count comments vs count replies
        sqlQuery = `SELECT
                     evaluations.crp_id AS crp_id,
                     evaluations.indicator_view_name AS indicator_view_name,
                     indicator.primary_field AS primary_field,
                     (SELECT enable_crp FROM qa_comments_meta comments_meta WHERE comments_meta.indicatorId = indicator.id) AS indicator_status,
                     indicator.order AS indicator_order, 
                     COUNT(DISTINCT evaluations.id) AS count,
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
                                                                 AND cycleId = 1
                                                 )
                                     
                                 ),
                                 "complete",
                                 "pending"   
                         )
                  AS evaluations_status
             FROM
                 qa_evaluations evaluations
             LEFT JOIN qa_indicators indicator ON indicator.view_name = evaluations.indicator_view_name

             LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
             
             WHERE (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
             AND evaluations.crp_id = '${crp_id}'
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
                     evaluations_status DESC`;

        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            sqlQuery,
            {},
            {}
          );

        rawData = await queryRunner.connection.query(query, parameters);
      } else {
        // CRP UNDEFINED
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT
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
                AND (evaluations.evaluation_status <> 'Deleted' AND evaluations.evaluation_status <> 'Removed' OR evaluations.evaluation_status IS NULL AND evaluations.batchDate >= actual_batch_date())
                LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id AND crp.active = 1 AND crp.qa_active = 'open'
                GROUP BY
                    evaluations.status,
                    indicator.view_name,
                    indicator_order,
                    indicator.primary_field
                ORDER BY
                    indicator.order ASC,
                    evaluations.status `,
            {},
            {}
          );

        rawData = await queryRunner.connection.query(query, parameters);
      }

      let response = [];

      for (let index = 0; index < rawData.length; index++) {
        const element = rawData[index];
        response.push({
          indicator_view_name: element["indicator_view_name"],
          status: element["status"]
            ? element["status"]
            : element["evaluations_status"],
          type: Util.getType(
            element["status"]
              ? element["status"]
              : element["evaluations_status"],
            crp_id !== undefined && crp_id !== "undefined"
          ),
          value: element["count"],
          indicator_status: element["indicator_status"],
          crp_id: crp_id ? element["crp_id"] : null,
          label: `${element["count"]}`,
          primary_field: element["primary_field"],
          order: element["indicator_order"],
        });
      }
      let result = Util.groupBy(response, "indicator_view_name");
      // res.status(200).json({ data: rawData, message: "All evaluations" });
      res.status(200).json({ data: result, message: "All evaluations by crp" });
    } catch (error) {
      res.status(404).json({
        message: "All evaluations by crp could not access to evaluations.",
      });
    }
  };

  static getEvaluationStatus = async (req: Request, res: Response) => {
    const { result_id } = req.params;
    let queryRunner = getConnection().createQueryBuilder();

    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT
                        evaluations.indicator_view_id,
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
                                                )
                                ),
                                "complete",
                                "pending"
                        ) AS evaluations_status
                FROM
                        qa_evaluations evaluations
                        WHERE evaluations.indicator_view_id = :result_id`,
          { result_id },
          {}
        );
      let rawData = await queryRunner.connection.query(query, parameters);
      res.status(200).json({
        data: Util.parseEvaluationsData(rawData),
        message: `Evaluation status for result: ${result_id}`,
      });
    } catch (error) {
      res.status(400).json({
        message:
          "An error ocurred when trying to retrieve the evaluation status",
      });
    }
  };

  // get evaluations LIST by user - List of indicators
  static getListEvaluationsDash = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;
    const { crp_id } = req.query;
    // const view_name = `qa_${req.body.view_name}`;
    const view_name = req.body.view_name;
    const view_primary_field = req.body.view_primary_field;
    const levelQuery = EvaluationsController.getLevelQuery(view_name);

    let queryRunner = getConnection().createQueryBuilder();
    try {
      const userRepository = getRepository(QAUsers);
      let user = await userRepository.findOneOrFail({ where: { id } });
      let isAdmin = user.roles.find((x) => x.description == RolesHandler.admin);
      if (isAdmin && (crp_id == null || crp_id == "undefined")) {
        let sql = `
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
                    ${levelQuery.view_sql}
                    (
                        SELECT title FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
                    ) AS title,
                    (
                        SELECT version FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
                    ) AS version,
                    crp.action_area AS crp_action_area,
                    (
                        SELECT result_code FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
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
                    ${levelQuery.innovations_stage}
                    evaluations.id
            `;
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            sql,
            { view_name },
            {}
          );
        let rawData = await queryRunner.connection.query(query, parameters);
        res.status(200).json({
          data: Util.parseEvaluationsData(rawData),
          message: "User evaluations list",
        });
        return;
      } else if (user.crps.length > 0) {
        let sql = `
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
              SELECT title FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
            ) AS title,
            (
              SELECT version FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
            ) AS version,
            crp.action_area AS crp_action_area,
            (
              SELECT result_code FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
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
            ${levelQuery.innovations_stage}
            indicator_user.indicatorId;
        `;

        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            sql,
            { crp_id: crp_id, view_name },
            {}
          );
        let rawData = await queryRunner.connection.query(query, parameters);
        res.status(200).json({
          data: Util.parseEvaluationsData(rawData),
          message: "CRP evaluations list",
        });
      } else {
        let sql = `
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
                            SELECT title FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
                        ) AS title,
                        (
                            SELECT version FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
                        ) AS version,
                        crp.action_area AS crp_action_area,
                        (
                            SELECT result_code FROM ${view_name} ${view_name} WHERE ${view_name}.id = evaluations.indicator_view_id
                        ) AS result_code,
                        ${levelQuery.view_sql}
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
                        ${levelQuery.innovations_stage}
                        indicator_user.indicatorId
                `;
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            sql,
            { user_Id: id, view_name },
            {}
          );
        let rawData = await queryRunner.connection.query(query, parameters);
        res.status(200).json({
          data: Util.parseEvaluationsData(rawData),
          message: "User evaluations list",
        });
      }
    } catch (error) {
      res.status(404).json({
        message: "User evaluations list could not access to evaluations.",
      });
    }
  };

  private static getLevelQuery(view_name: string) {
    let response = {
      view_sql: "",
      innovations_stage: "",
    };
    switch (view_name) {
      case "qa_indicato":
        response.view_sql =
          "(SELECT stage FROM qa_indicato innovations WHERE innovations.id = evaluations.indicator_view_id) AS stage,";
        // response.innovations_stage = "qa_innovations.stage,"
        break;
      case "qa_policies":
        response.view_sql =
          "(SELECT maturity_level FROM qa_policies policies WHERE policies.id = evaluations.indicator_view_id) AS stage,";
        // response.innovations_stage = "qa_policies.maturity_level,"
        break;
      case "qa_oicr":
        response.view_sql =
          "(SELECT maturity_level FROM qa_oicr oicr WHERE oicr.id = evaluations.indicator_view_id) AS stage,";
        // response.innovations_stage = "qa_oicr.maturity_level,"
        break;
      case "qa_melia":
        response.view_sql =
          "(SELECT study_type FROM qa_melia melia WHERE melia.id = evaluations.indicator_view_id) AS stage,";
        // response.innovations_stage = "qa_melia.study_type,"
        break;
      case "qa_publications":
        response.view_sql =
          "(SELECT is_ISI FROM qa_publications publications WHERE publications.id = evaluations.indicator_view_id) AS stage,";
        // response.innovations_stage = "qa_melia.study_type,"
        break;
      case "qa_milestones":
        response.view_sql =
          "(SELECT status FROM qa_milestones milestones WHERE milestones.id = evaluations.indicator_view_id) AS stage, (SELECT fp FROM qa_milestones milestones WHERE milestones.id = evaluations.indicator_view_id) AS fp,";
      // response.innovations_stage = "qa_melia.study_type,"
      case "qa_slo":
        response.view_sql =
          "(SELECT clean_html_tags(brief_summary) FROM qa_slo slo WHERE slo.id = evaluations.indicator_view_id) AS brief,";
        // response.innovations_stage = "qa_melia.study_type,"
        break;

      default:
        break;
    }
    return response;
  }

  // get detailed evaluation by user -- TODO - GET data by field
  static getDetailedEvaluationDash = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;
    const view_name = `qa_${req.body.type}`;
    const view_name_psdo = `${req.body.type}`;
    const indicatorId = req.body.indicatorId;
    let queryRunner = getConnection().createQueryBuilder();

    //Get indicator item data from view
    try {
      const userRepository = getRepository(QAUsers);
      let user = await userRepository.findOneOrFail({ where: { id } });
      let isAdmin = user.roles.find((x) => x.description == RolesHandler.admin);
      let rawData;
      if (isAdmin) {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                        SELECT
                            ${view_name_psdo}.*, 
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
                            ${view_name} ${view_name_psdo}
                        LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_id = ${view_name_psdo}.id
                        LEFT JOIN qa_indicators indicators ON indicators.view_name = '${view_name}'
                        LEFT JOIN qa_indicators_meta meta ON meta.indicatorId = indicators.id
                        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
                        LEFT JOIN qa_comments qa ON qa.highlightById = evaluations.crp_id
                        WHERE ${view_name_psdo}.id = :indicatorId 
                        AND evaluations.indicator_view_name = '${view_name}'
                        AND evaluations.phase_year = actual_phase_year()
                        ORDER BY meta.order ASC
                        `,
            { user_Id: id, indicatorId },
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      } else if (user.crps.length > 0) {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                        SELECT
                            ${view_name_psdo}.*, 
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
                            ${view_name} ${view_name_psdo}
                        LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_id = ${view_name_psdo}.id
                        LEFT JOIN qa_indicators indicators ON indicators.view_name = '${view_name}'
                        LEFT JOIN qa_indicators_meta meta ON meta.indicatorId = indicators.id
                        LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
                        WHERE ${view_name_psdo}.id = :indicatorId 
                        AND evaluations.indicator_view_name = '${view_name}'
                        AND evaluations.phase_year = actual_phase_year()
                        ORDER BY meta.order ASC
                        `,
            { user_Id: id, indicatorId },
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      } else {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                    SELECT
                        ${view_name_psdo}.*, 
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
                        ${view_name} ${view_name_psdo}
                    LEFT JOIN qa_evaluations evaluations ON evaluations.indicator_view_id = ${view_name_psdo}.id
                    LEFT JOIN qa_indicators indicators ON indicators.view_name = '${view_name}'
                    LEFT JOIN qa_indicator_user indicator_user ON indicator_user.indicatorId = indicators.id
                    LEFT JOIN qa_indicators_meta meta ON meta.indicatorId = indicators.id
                    LEFT JOIN qa_crp crp ON crp.crp_id = evaluations.crp_id
                    WHERE indicator_user.userId = :user_Id
                    AND ${view_name_psdo}.id = :indicatorId
                    AND evaluations.indicator_view_name = '${view_name}'
                    AND evaluations.phase_year = actual_phase_year()
                    ORDER BY meta.order ASC
                    `,
            { user_Id: id, indicatorId },
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      }

      res.status(200).json({
        data: Util.parseEvaluationsData(rawData, view_name_psdo),
        message: "User evaluation detail",
      });
    } catch (error) {
      res.status(404).json({
        message: "User evaluation detail could not access to evaluations.",
      });
    }
  };

  // FIX TODO
  static updateDetailedEvaluation = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = res.locals.jwtPayload.userId;
    const { general_comments, status } = req.body;

    // const userRepository = getRepository(QAUsers);
    // let user = await userRepository.findOneOrFail({ where: { id: userId } });

    const evaluationsRepository = getRepository(QAEvaluations);
    let queryRunner = getConnection().createQueryBuilder().connection;
    try {
      let evaluation = await evaluationsRepository.findOne({
        where: { id: id },
      });

      // evaluation.general_comments = general_comments;
      evaluation.status = status;
      if (status === StatusHandler.Finalized) {
        let sql = `
                    SELECT id from qa_indicators_meta WHERE indicatorId IN (SELECT id FROM qa_indicators WHERE view_name = :view_name) AND col_name = 'id';
                `;
        const [query, parameters] =
          await queryRunner.driver.escapeQueryWithParameters(
            sql,
            { view_name: evaluation.indicator_view_name },
            {}
          );
        // evaluation.assessed_by_second_round.push(user);

        let metaId = await queryRunner.query(query, parameters);
        // let comment = await Util.createComment(null, true, userId, metaId[0].id, evaluation.id, require_changes);
      }

      let updatedEva = await evaluationsRepository.save(evaluation);
      res
        .status(200)
        .json({ data: updatedEva, message: "Evaluation updated." });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Could not update evaluation.", data: error });
    }
  };

  // get all CRPS
  static getCRPS = async (req: Request, res: Response) => {
    const crpRepository = await getRepository(QACrp);

    try {
      let allCRP = await crpRepository.find({ where: { active: true } });
      res.status(200).json({ data: allCRP, message: "All CRPs" });
    } catch (error) {
      res.status(404).json({ message: "Could not get crp." });
    }
  };

  //get active indicators (admin dashboard)
  static getIndicatorsByCrp = async (req: Request, res: Response) => {
    //const indiUserRepository = getRepository(QAIndicatorUser);
    let queryRunner = getConnection().createQueryBuilder();
    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
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
                    indicators.order ASC
                `,
          {},
          {}
        );
      let evalData = await queryRunner.connection.query(query, parameters);
      res.status(200).json({ data: evalData, message: "Indicators settings" });
    } catch (error) {
      res.status(404).json({ message: "Could not get indicators settings." });
    }
  };

  //get evaluation criteria by indicator
  static getCriteriaByIndicator = async (req: Request, res: Response) => {
    const { indicatorName } = req.params;
    let queryRunner = getConnection().createQueryBuilder();
    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT
                    qa_criteria
                FROM
                    qa_indicators indicators
                WHERE view_name = :indicatorName
                       `,
          { indicatorName },
          {}
        );
      let evalData = await queryRunner.connection.query(query, parameters);
      res
        .status(200)
        .json({ data: evalData, message: "Indicator evaluation criteria" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Could not get any evaluation criteria." });
    }
  };

  static getAssessorsByEvaluations = async (req: Request, res: Response) => {
    const { evaluationId } = req.params;
    let queryRunner = getConnection().createQueryBuilder();
    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
                SELECT     group_concat(DISTINCT users.username separator ', ') as assessed_r1
                FROM
                qa_evaluations_assessed_by_qa_users qea
                LEFT JOIN qa_users users ON users.id = qea.qaUsersId
                WHERE qea.qaEvaluationsId = :evaluationId;         
                       `,
          { evaluationId },
          {}
        );
      let assessorByEvalR1 = await queryRunner.connection.query(
        query,
        parameters
      );

      const [query2, parameters2] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
                SELECT group_concat(DISTINCT users2.username separator ', ') as assessed_r2 FROM
                qa_evaluations_assessed_by_second_round_qa_users qea2
                LEFT JOIN qa_users users2 ON users2.id = qea2.qaUsersId
                WHERE qea2.qaEvaluationsId = :evaluationId;         
                       `,
          { evaluationId },
          {}
        );

      let assessorByEvalR2 = await queryRunner.connection.query(
        query2,
        parameters2
      );
      const response = {
        assessed_r1: assessorByEvalR1[0].assessed_r1 || "Not yet assessed",
        assessed_r2: assessorByEvalR2[0].assessed_r2 || "Not yet assessed",
      };

      res.status(200).json({
        data: response,
        message: `Assessors in  evaluation ${evaluationId}`,
      });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Could not get any assesor for this evaluation." });
    }
  };

  static updateRequireSecondEvaluation = async (
    req: Request,
    res: Response
  ) => {
    const evaluationId = req.params.id;

    const { require_second_assessment } = req.body;
    const evaluationsRepository = getRepository(QAEvaluations);

    try {
      let evaluation = await evaluationsRepository.findOne(evaluationId);
      evaluation.require_second_assessment = require_second_assessment;
      evaluationsRepository.save(evaluation);

      res.status(200).json({
        data: evaluation,
        message: `Evaluation ${evaluationId} updated.`,
      });
    } catch (error) {
      res.status(404).json({ message: "Could not update the evaluation." });
    }
  };

  static pendingHighlights = async (req: Request, res: Response) => {
    let queryRunner = getConnection().createQueryBuilder();

    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT
                    SUM(
                        IF(
                            comments.highlight_comment = 1
                            AND comments.is_deleted = 0,
                            1,
                            0
                        )
                    ) AS pending_highlight_comments,
                    SUM(
                        IF(
                            comments.tpb = 1
                            AND comments.is_deleted = 0,
                            1,
                            0
                        )
                    ) AS total_tpb_comments,
                    SUM(
                        IF(
                            comments.require_changes = 1
                            AND comments.is_deleted = 0,
                            1,
                            0
                        )
                    ) AS solved_with_require_request,
                    SUM(
                        IF(
                            comments.require_changes = 0
                            AND comments.tpb = 1
                            AND comments.is_deleted = 0,
                            1,
                            0
                        )
                    ) AS solved_without_require_request,
                    SUM(
                        IF(
                            comments.require_changes = 1
                            AND comments.ppu = 0
                            AND comments.is_deleted = 0,
                            1,
                            0
                        )
                    ) AS pending_tpb_decisions,
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
                GROUP BY
                    evaluations.indicator_view_name;`,
          {},
          {}
        );

      let highlights = await queryRunner.connection.query(query, parameters);

      let data = [];
      for (let i = 0; i < highlights.length; i++) {
        const convert = highlights[i];
        let pending_highlight_comments =
          convert.pending_highlight_comments - convert.total_tpb_comments;
        let solved_with_require_request = convert.solved_with_require_request;
        let solved_without_require_request =
          convert.solved_without_require_request;
        let pending_tpb_decisions = convert.pending_tpb_decisions;
        let indicator_view_name = convert.indicator_view_name;

        data.push({
          pending_highlight_comments,
          solved_with_require_request,
          solved_without_require_request,
          pending_tpb_decisions,
          indicator_view_name,
        });
      }

      res.status(200).json({ data: data, message: "All highlights status" });
    } catch (error) {
      res.status(200).json({
        data: error,
        message: "Could not retrieve the highlighted status",
      });
    }
  };
}

export default EvaluationsController;
