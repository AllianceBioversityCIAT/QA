import e, { Request, Response } from "express";
import { validate } from "class-validator";
import {
  getRepository,
  In,
  getConnection,
  IsNull,
  Not,
  getTreeRepository,
  QueryBuilder,
  Repository,
} from "typeorm";

import { QAUsers } from "./../entity/User";
import { QAComments } from "./../entity/Comments";
import { QACommentsMeta } from "./../entity/CommentsMeta";

import Util from "./../_helpers/Util";
import { QACommentsReplies } from "./../entity/CommentsReplies";
import { RolesHandler } from "./../_helpers/RolesHandler";
import { QAEvaluations } from "./../entity/Evaluations";
import { QACycle } from "./../entity/Cycles";
import { QATags } from "./../entity/Tags";
import { QAReplyType } from "./../entity/ReplyType";
import { StatusHandler } from "../_helpers/StatusHandler";
const { htmlToText } = require("html-to-text");

class CommentController {
  static commentsCount = async (req: Request, res: Response) => {
    const { crp_id } = req.query;
    const userId = res.locals.jwtPayload.userId;
    const queryRunner = getConnection().createQueryBuilder();
    const userRepository = getRepository(QAUsers);
    let rawData;
    let user: QAUsers;
    try {
      user = await userRepository.findOneOrFail(userId);
      let role = user.roles[0].description;

      if (crp_id !== undefined && crp_id !== "undefined") {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT
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
                AND evaluations.crp_id = :crp_id
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
                type DESC;`,
            { crp_id },
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      } else {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT
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

                        `,
            {},
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      }

      res.status(200).json({
        data: Util.groupBy(rawData, "indicator_view_name"),
        message: "Comments statistics",
      });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Could not access to comments statistics." });
    }
  };

  static createCommentReply = async (req: Request, res: Response) => {
    const { detail, userId, commentId, crp_approved, approved, replyTypeId } =
      req.body;

    const userRepository = getRepository(QAUsers);
    const commentReplyRepository = getRepository(QACommentsReplies);
    const commentsRepository = getRepository(QAComments);
    const replyTypeRepository = getRepository(QAReplyType);

    try {
      let user = await userRepository.findOneOrFail({ where: { id: userId } });
      let comment = await commentsRepository.findOneOrFail({
        where: { id: commentId },
      });
      let replyType = await replyTypeRepository.findOneOrFail({
        where: { id: replyTypeId },
      });
      comment.replyType = replyType;
      let reply = new QACommentsReplies();
      reply.detail = detail;
      reply.comment = comment;
      reply.user = user;

      let new_replay = await commentReplyRepository.save(reply);
      if (user.roles.find((x) => x.description == RolesHandler.crp)) {
        comment.crp_approved = crp_approved;
        comment = await commentsRepository.save(comment);
      }
      res.status(200).send({ data: new_replay, message: "Comment created" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comment can not be created.", data: error });
    }
  };

  static createComment = async (req: Request, res: Response) => {
    const {
      detail,
      approved,
      userId,
      metaId,
      evaluationId,
      original_field,
      require_changes,
      tpb,
    } = req.body;

    try {
      let new_comment = await Util.createComment(
        detail,
        approved,
        userId,
        metaId,
        evaluationId,
        original_field,
        require_changes,
        tpb
      );
      if (new_comment == null) throw new Error("Could not created comment");
      res.status(200).send({ data: new_comment, message: "Comment created" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comment can not be created.", data: error });
    }
  };

  static updateComment = async (req: Request, res: Response) => {
    const {
      approved,
      is_visible,
      is_deleted,
      id,
      detail,
      userId,
      require_changes,
      tpb,
    } = req.body;
    const commentsRepository = getRepository(QAComments);
    const tagsRepository = getRepository(QATags);

    try {
      let comment_ = await commentsRepository.findOneOrFail(id, {
        relations: ["tags"],
      });
      if (is_deleted) {
        tagsRepository.remove(comment_.tags);
      }
      comment_.approved = approved;
      comment_.is_deleted = is_deleted;
      comment_.is_visible = is_visible;
      comment_.require_changes = require_changes;
      comment_.tpb = tpb;
      if (detail) comment_.detail = detail;
      if (userId) comment_.user = userId;

      let updated_comment = await commentsRepository.save(comment_);

      res
        .status(200)
        .send({ data: updated_comment, message: "Comment updated" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comment can not be updated.", data: error });
    }
  };

  static updateCommentReply = async (req: Request, res: Response) => {
    const { is_deleted, id, detail, userId } = req.body;
    const repliesRepository = getRepository(QACommentsReplies);

    try {
      let reply_ = await repliesRepository.findOneOrFail(id, {
        relations: ["comment"],
      });

      reply_.is_deleted = is_deleted;
      if (detail) reply_.detail = detail;
      if (userId) reply_.user = userId;
      if (reply_.is_deleted) {
        const commentsRepository = await getRepository(QAComments);
        let comment = await commentsRepository.findOneOrFail(reply_.comment.id);
        comment.crp_approved = null;
        comment.replyType = null;
        commentsRepository.save(comment);
      }

      let updated_comment = await repliesRepository.save(reply_);

      res.status(200).send({ data: updated_comment, message: "Reply updated" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Reply can not be updated.", data: error });
    }
  };

  static getAllIndicatorTags = async (req: Request, res: Response) => {
    const { crp_id } = req.query;

    let queryRunner = getConnection().createQueryBuilder();
    try {
      let tagsByIndicators;
      if (crp_id !== "undefined") {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT qe.indicator_view_name, tt.name as tagType, count(*) as total
                    FROM qa_tags tag 
                    LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                    LEFT JOIN qa_users us ON us.id = tag.userId
                    LEFT JOIN qa_comments  qc ON qc.id = tag.commentId
                    LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
                    WHERE tt.name not like "seen"
                    AND qe.crp_id = :crp_id
                    AND qe.phase_year = actual_phase_year()
                    GROUP BY qe.indicator_view_name, tt.name
                    `,
            { crp_id },
            {}
          );
        tagsByIndicators = await queryRunner.connection.query(
          query,
          parameters
        );
      } else {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT qe.indicator_view_name, tt.name as tagType, count(*) as total
                    FROM qa_tags tag 
                    LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                    LEFT JOIN qa_users us ON us.id = tag.userId
                    LEFT JOIN qa_comments  qc ON qc.id = tag.commentId
                    LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
                    WHERE tt.name not like "seen"
                    AND qe.phase_year = actual_phase_year()
                    GROUP BY qe.indicator_view_name, tt.name;
                    `,
            {},
            {}
          );
        tagsByIndicators = await queryRunner.connection.query(
          query,
          parameters
        );
      }
      res
        .status(200)
        .send({ data: tagsByIndicators, message: "All tags by indicator" });
    } catch (error) {
      res.status(404).json({
        message: "Tags by indicators can not be retrived.",
        data: error,
      });
    }
  };

  static getFeedTags = async (req: Request, res: Response) => {
    const { indicator_view_name, tagTypeId } = req.query;

    let tags;
    let queryRunner = getConnection().createQueryBuilder();
    try {
      if (indicator_view_name !== "undefined" && tagTypeId !== "undefined") {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT us.id, us.name, tt.name as tagName, tt.id as tagId, tag.createdAt, tag.updatedAt, qe.indicator_view_id, qe.indicator_view_name
                    FROM qa_tags tag 
                    LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                    LEFT JOIN qa_users us ON us.id = tag.userId
                    LEFT JOIN qa_comments  qc ON qc.id = tag.commentId
                    LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
                    WHERE qe.indicator_view_name = :indicator_view_name
                    AND tt.id = :tagTypeId
                    ORDER BY tag.createdAt DESC`,
            { indicator_view_name, tagTypeId },
            {}
          );
        tags = await queryRunner.connection.query(query, parameters);
      } else if (
        indicator_view_name !== "undefined" &&
        tagTypeId === "undefined"
      ) {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT us.id, us.name, tt.name as tagName, tt.id as tagId, tag.createdAt, tag.updatedAt, qe.indicator_view_id, qe.indicator_view_name
                    FROM qa_tags tag 
                    LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                    LEFT JOIN qa_users us ON us.id = tag.userId
                    LEFT JOIN qa_comments  qc ON qc.id = tag.commentId
                    LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
                    WHERE qe.indicator_view_name = :indicator_view_name
                    ORDER BY tag.createdAt DESC`,
            { indicator_view_name },
            {}
          );
        tags = await queryRunner.connection.query(query, parameters);
      } else {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT us.id, us.name, tt.name as tagName, tt.id as tagId, tag.createdAt, tag.updatedAt, qe.indicator_view_id, qe.indicator_view_name
                    FROM qa_tags tag 
                    LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                    LEFT JOIN qa_users us ON us.id = tag.userId
                    LEFT JOIN qa_comments  qc ON qc.id = tag.commentId
                    LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
                    ORDER BY tag.createdAt DESC;`,
            {},
            {}
          );
        tags = await queryRunner.connection.query(query, parameters);
      }

      res
        .status(200)
        .send({ data: tags, message: "All new tags order by date (desc)" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Recent tags can not be retrived.", data: error });
    }
  };

  static getComments = async (req: Request, res: Response) => {
    const evaluationId = req.params.evaluationId;
    const metaId = req.params.metaId;

    let queryRunner = getConnection().createQueryBuilder();
    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT
                id,
                (
                    SELECT
                        COUNT(DISTINCT id)
                    FROM
                        qa_comments_replies
                    WHERE
                        commentId = qa_comments.id
                        AND is_deleted = 0
                ) AS replies_count,
                (
                    SELECT
                        qu.username
                    FROM
                        qa_users qu
                    WHERE
                        qa_comments.highlightById = qu.id
                ) AS highlight_by,
                highlight_comment,
                highlightById
            FROM
                qa_comments
            WHERE
                metaId = :metaId
                AND evaluationId = :evaluationId
                AND approved_no_comment IS NULL
                `,
          { metaId, evaluationId },
          {}
        );
      let replies = await queryRunner.connection.query(query, parameters);
      let comments = await CommentController.getCommts(metaId, evaluationId);

      for (let index = 0; index < comments.length; index++) {
        const comment = comments[index];
        comment.replies = replies.find((reply) => reply.id == comment.id);
        const commentId = comment.id;
        const [queryTags, parametersTag] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `SELECT tag.id as tag_id,tt.id as tag_type, tt.name as tag_name, us.name as user_name, us.id as userId
                        FROM qa_tags tag 
                        JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                        JOIN qa_users us ON us.id = tag.userId
                        WHERE tag.commentId = :commentId;`,
            { commentId },
            {}
          );

        comment.tags = await queryRunner.connection.query(
          queryTags,
          parametersTag
        );
      }
      res.status(200).send({ data: comments, message: "All comments" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comments can not be retrived.", data: error });
    }
  };

  static patchPpuChanges = async (req: Request, res: Response) => {
    const commentsRepository = getRepository(QAComments);
    const { ppu, commentReplyId } = req.body;
    let message: String;

    try {
      let commentReplyId_ = await commentsRepository.findOneOrFail(
        commentReplyId
      );
      commentReplyId_.ppu = ppu;

      if (ppu != 0) {
        const commentReplyId = await commentsRepository.save(commentReplyId_);
        message = `Require changes was marked done`;
        res
          .status(202)
          .json({ reply_comment: commentReplyId, message: message });
      } else {
        const commentReplyId = await commentsRepository.save(commentReplyId_);
        message = "Require changes was removed";
        res
          .status(202)
          .json({ reply_comment: commentReplyId, message: message });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: "An error ocurred when try to mark require changes" });
    }
  };

  static patchRequireChanges = async (req: Request, res: Response) => {
    const commentsRepository = getRepository(QAComments);
    const { require_changes, id } = req.body;
    let update_require_changes;
    let message: String;

    try {
      let comment_ = await commentsRepository.findOneOrFail(id);

      if (require_changes != 0) {
        comment_.require_changes = require_changes;
        update_require_changes = await commentsRepository.save(comment_);
        message = `The TPB instruction was successfully created with require changes`;
      } else {
        comment_.require_changes = 0;
        update_require_changes = await commentsRepository.save(comment_);
        message = "The TPB instruction was successfully created";
      }
      res.status(202).json({ data: update_require_changes, message: message });
    } catch (error) {
      res
        .status(400)
        .json({ message: "An error ocurred when try to mark require changes" });
    }
  };

  static patchHighlightComment = async (req: Request, res: Response) => {
    const commentsRepository = getRepository(QAComments);
    const userId = res.locals.jwtPayload;
    const { highlight_comment, id } = req.body;
    let updated_comment;
    let message: String;

    try {
      let comment_ = await commentsRepository.findOneOrFail(id);
      comment_.highlight_by = userId.userId;
      comment_.highlight_comment = highlight_comment;

      if (highlight_comment != 0) {
        updated_comment = await commentsRepository.save(comment_);
        message = `Assessment highlighted by  ${userId.username}`;
      } else {
        updated_comment = await commentsRepository.update(id, {
          highlight_by: null,
          highlight_comment: 0,
        });
        message = `Highligh mark was removed in comment by ${userId.username}`;
      }

      res.status(201).send({ data: updated_comment, message: message });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Highlight comment can not be set.", data: error });
    }
  };

  static getCommentsReplies = async (req: Request, res: Response) => {
    const commentId = req.params.commentId;

    if (commentId != undefined && commentId != null) {
      try {
        let replies = await getRepository(QACommentsReplies).find({
          where: [
            {
              comment: commentId,
              is_deleted: Not(1),
            },
          ],
          relations: ["user"],
          order: {
            createdAt: "ASC",
          },
        });
        res
          .status(200)
          .send({ data: replies, message: "All comments replies" });
      } catch (error) {
        res
          .status(404)
          .json({ message: "Comment can not be retrived.", data: error });
      }
    } else {
      res.status(404).json({
        message: "Comment can not be retrieved. Comment ID not provided",
        data: null,
      });
    }
  };

  static createcommentsMeta = async (req: Request, res: Response) => {
    const commentMetaRepository = getRepository(QACommentsMeta);
    let queryRunner = getConnection().createQueryBuilder();

    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT
                *
                FROM
                qa_indicators
                WHERE
                qa_indicators.id NOT IN (SELECT indicatorId FROM qa_comments_meta )`,
          {},
          {}
        );

      let indicators = await queryRunner.connection.query(query, parameters);

      let savePromises = [];
      for (let index = 0; index < indicators.length; index++) {
        const element = indicators[index];
        let newCommentMeta = new QACommentsMeta();

        newCommentMeta.enable_assessor = false;
        newCommentMeta.enable_crp = false;
        newCommentMeta.indicator = element;
        savePromises.push(newCommentMeta);
      }

      let response = await commentMetaRepository.save(savePromises);

      res
        .status(200)
        .send({ data: response, message: "Comments meta created" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comment meta was not created.", data: error });
    }
  };

  static editCommentsMeta = async (req: Request, res: Response) => {
    const id = req.params.id;

    let { enable, isActive } = req.body;

    const commentMetaRepository = getRepository(QACommentsMeta);
    let commentMeta, updatedCommentMeta;

    try {
      commentMeta = await commentMetaRepository
        .createQueryBuilder("qa_comments_meta")
        .select("id, enable_crp, enable_assessor")
        .where("qa_comments_meta.indicatorId=:indicatorId", { indicatorId: id })
        .getRawOne();
      commentMeta[enable] = isActive;

      const errors = await validate(commentMeta);
      if (errors.length > 0) {
        res.status(400).json({ data: errors, message: "Error found" });
        return;
      }

      commentMeta = await commentMetaRepository.save(commentMeta);
    } catch (error) {
      res
        .status(404)
        .json({ message: "User indicator not found.", data: error });
    }

    res
      .status(200)
      .json({ message: "User indicator updated", data: commentMeta });
  };

  static getCommentsExcel = async (req: Request, res: Response) => {
    const { evaluationId } = req.params;
    const { userId, name, crp_id, indicatorName } = req.query;
    let queryRunner = getConnection().createQueryBuilder();

    let comments;
    try {
      const userRepository = getRepository(QAUsers);

      let user = await userRepository.findOneOrFail({
        where: [{ id: userId }],
      });
      let currentRole = user.roles.map((role) => {
        return role.description;
      })[0];
      if (evaluationId == undefined || evaluationId == "undefined") {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                    SELECT
                    comments.detail,
                    comments.id AS comment_id,
                    evaluations.indicator_view_id AS id,
                    comments.updatedAt,
                    comments.createdAt,
                    comments.crp_approved,
                    evaluations.crp_id,
                    evaluations.id AS evaluation_id,
                    users.username,
                    meta.display_name,
                    meta.col_name,
                    replies.createdAt AS reply_createdAt,
                    replies.updatedAt AS reply_updatedAt,
                    replies.detail AS reply,
                    (SELECT title FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS indicator_title,
                    (SELECT result_code FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS result_code,
                    (SELECT username FROM qa_users WHERE id = replies.userId) AS reply_user,
                    (SELECT cycle_stage FROM qa_cycle WHERE id = comments.cycleId) as cycle_stage
                    FROM
                    qa_comments comments
                    LEFT JOIN qa_users users ON users.id = comments.userId
                    LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                    LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
                    LEFT JOIN qa_indicators_meta meta ON meta.id = comments.metaId
                    WHERE
                    comments.detail IS NOT NULL
                    AND evaluations.indicator_view_name = :indicatorName
                    AND (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
                    AND comments.approved = 1
                    AND comments.is_deleted = 0
                    AND evaluations.crp_id = :crp_id
                    AND evaluations.phase_year = actual_phase_year()
                    ORDER BY createdAt ASC
                    `,
            { crp_id, indicatorName },
            {}
          );
        comments = await queryRunner.connection.query(query, parameters);
      } else {
        if (currentRole !== RolesHandler.crp) {
          const [query, parameters] =
            await queryRunner.connection.driver.escapeQueryWithParameters(
              `SELECT
                            evaluations.crp_id AS 'Init short name',
                            qcd.result_code AS 'Result code',
                            (
                                SELECT
                                    title
                                FROM
                                    ${indicatorName}_data
                                WHERE
                                    id = evaluations.indicator_view_id
                            ) AS 'Result title',
                            evaluations.phase_year AS 'Year',
                            evaluations.id AS 'Evaluation ID',
                            meta.display_name AS 'Field name',
                            IFNULL(
                                (
                                    SELECT 
                                        clean_html_tags(qc.original_field)
                                    FROM
                                        ${indicatorName}_data qcd2
                                        LEFT JOIN qa_evaluations qe ON qcd2.id = qe.indicator_view_id
                                        LEFT JOIN qa_comments qc ON qc.evaluationId = qe.id
                                        LEFT JOIN qa_indicators_meta qim ON qim.id = qc.metaId
                                    WHERE
                                        qcd2.result_code = qcd.result_code 
                                        AND qcd2.phase_year = 2022
                                        AND qe.phase_year = 2022
                                        AND qim.id = meta.id
                                        AND qc.detail IS NOT NULL
                                        AND (
                                            qe.evaluation_status <> 'Deleted'
                                            OR qe.evaluation_status IS NULL
                                        )
                                        AND qc.approved = 1
                                        AND qc.is_visible = 1
                                        AND qc.is_deleted = 0
                                        AND qc.approved_no_comment IS NULL
                                ),
                                'Not applicable'
                            ) AS 'Field value 2022',
                            IFNULL(
                                (
                                    SELECT 
                                        clean_html_tags(qc.detail)
                                    FROM
                                        ${indicatorName}_data qcd2
                                        LEFT JOIN qa_evaluations qe ON qcd2.id = qe.indicator_view_id
                                        LEFT JOIN qa_comments qc ON qc.evaluationId = qe.id
                                        LEFT JOIN qa_indicators_meta qim ON qim.id = qc.metaId
                                    WHERE
                                        qcd2.result_code = qcd.result_code 
                                        AND qcd2.phase_year = 2022
                                        AND qe.phase_year = 2022
                                        AND qim.id = meta.id
                                        AND qc.detail IS NOT NULL
                                        AND (
                                            qe.evaluation_status <> 'Deleted'
                                            OR qe.evaluation_status IS NULL
                                        )
                                        AND qc.approved = 1
                                        AND qc.is_visible = 1
                                        AND qc.is_deleted = 0
                                        AND qc.approved_no_comment IS NULL
                                ),
                                'Not applicable'
                            ) AS 'Comment 2022',
                            clean_html_tags(comments.original_field) AS 'Field value 2023',
                            clean_html_tags(comments.detail) AS 'Comment 2023',
                            comments.createdAt AS 'Created date',
                            users.username AS 'Assessor username',
                            users.email AS 'Assessor email',
                            (
                                SELECT
                                    qrt.name    	
                                FROM
                                    qa_reply_type qrt
                                WHERE 
                                    qrt.id = comments.replyTypeId
                            ) AS 'Init reply type',
                            replies.detail AS 'Init reply',
                            replies.createdAt AS 'Reply created date',
                            (
                                SELECT
                                    username
                                FROM
                                    qa_users
                                WHERE
                                    id = replies.userId
                            ) AS 'Init user',
                            (
                                SELECT
                                    cycle_stage
                                FROM
                                    qa_cycle
                                WHERE
                                    id = comments.cycleId
                            ) as 'Round'
                        FROM
                            qa_comments comments
                            LEFT JOIN qa_users users ON users.id = comments.userId
                            LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                            LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
                            AND replies.is_deleted = 0
                            LEFT JOIN qa_indicators_meta meta ON meta.id = comments.metaId
                            LEFT JOIN ${indicatorName}_data qcd ON qcd.id = evaluations.indicator_view_id 
                        WHERE
                            comments.detail IS NOT NULL
                            AND qcd.result_code IN (
                                SELECT
                                    qcd2.result_code
                                FROM
                                    ${indicatorName} qcd2
                                    JOIN qa_evaluations qe ON qe.indicator_view_id = qcd2.id
                                WHERE
                                    qe.indicator_view_id = qcd2.id
                                    AND qe.id = :evaluationId
                            )
                            AND (
                                evaluations.evaluation_status <> 'Deleted'
                                OR evaluations.evaluation_status IS NULL
                            )
                            AND comments.approved = 1
                            AND comments.is_visible = 1
                            AND comments.is_deleted = 0
                            AND comments.approved_no_comment IS NULL
                        GROUP BY
                            evaluations.phase_year,
                            comments.detail,
                            comments.id,
                            replies.createdAt,
                            replies.updatedAt,
                            replies.detail,
                            replies.userId
                        ORDER BY
                            evaluations.phase_year ASC,
                            comments.createdAt ASC;
                            `,
              { evaluationId },
              {}
            );
          comments = await queryRunner.connection.query(query, parameters);
        } else {
          const [query, parameters] =
            await queryRunner.connection.driver.escapeQueryWithParameters(
              `SELECT
                            evaluations.crp_id AS 'Init short name',
                            qcd.result_code AS 'Result code',
                            (
                                SELECT
                                    title
                                FROM
                                    ${indicatorName}_data
                                WHERE
                                    id = evaluations.indicator_view_id
                            ) AS 'Result title',
                            evaluations.phase_year AS 'Year',
                            evaluations.id AS 'Evaluation ID',
                            meta.display_name AS 'Field name',
                            IFNULL(
                                (
                                    SELECT 
                                        clean_html_tags(qc.original_field)
                                    FROM
                                        ${indicatorName}_data qcd2
                                        LEFT JOIN qa_evaluations qe ON qcd2.id = qe.indicator_view_id
                                        LEFT JOIN qa_comments qc ON qc.evaluationId = qe.id
                                        LEFT JOIN qa_indicators_meta qim ON qim.id = qc.metaId
                                    WHERE
                                        qcd2.result_code = qcd.result_code 
                                        AND qcd2.phase_year = 2022
                                        AND qe.phase_year = 2022
                                        AND qim.id = meta.id
                                        AND qc.detail IS NOT NULL
                                        AND (
                                            qe.evaluation_status <> 'Deleted'
                                            OR qe.evaluation_status IS NULL
                                        )
                                        AND qc.approved = 1
                                        AND qc.is_visible = 1
                                        AND qc.is_deleted = 0
                                        AND qc.approved_no_comment IS NULL
                                ),
                                'Not applicable'
                            ) AS 'Field value 2022',
                            IFNULL(
                                (
                                    SELECT 
                                        clean_html_tags(qc.detail)
                                    FROM
                                        ${indicatorName}_data qcd2
                                        LEFT JOIN qa_evaluations qe ON qcd2.id = qe.indicator_view_id
                                        LEFT JOIN qa_comments qc ON qc.evaluationId = qe.id
                                        LEFT JOIN qa_indicators_meta qim ON qim.id = qc.metaId
                                    WHERE
                                        qcd2.result_code = qcd.result_code 
                                        AND qcd2.phase_year = 2022
                                        AND qe.phase_year = 2022
                                        AND qim.id = meta.id
                                        AND qc.detail IS NOT NULL
                                        AND (
                                            qe.evaluation_status <> 'Deleted'
                                            OR qe.evaluation_status IS NULL
                                        )
                                        AND qc.approved = 1
                                        AND qc.is_visible = 1
                                        AND qc.is_deleted = 0
                                        AND qc.approved_no_comment IS NULL
                                ),
                                'Not applicable'
                            ) AS 'Comment 2022',
                            clean_html_tags(comments.original_field) AS 'Field value 2023',
                            clean_html_tags(comments.detail) AS 'Comment 2023',
                            comments.createdAt AS 'Created date',
                            users.username AS 'Assessor username',
                            (
                                SELECT
                                    qrt.name    	
                                FROM
                                    qa_reply_type qrt
                                WHERE 
                                    qrt.id = comments.replyTypeId
                            ) AS 'Init reply type',
                            replies.detail AS 'Init reply',
                            replies.createdAt AS 'Reply created date',
                            (
                                SELECT
                                    username
                                FROM
                                    qa_users
                                WHERE
                                    id = replies.userId
                            ) AS 'Init user',
                            (
                                SELECT
                                    cycle_stage
                                FROM
                                    qa_cycle
                                WHERE
                                    id = comments.cycleId
                            ) as 'Round'
                        FROM
                            qa_comments comments
                            LEFT JOIN qa_users users ON users.id = comments.userId
                            LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                            LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
                            AND replies.is_deleted = 0
                            LEFT JOIN qa_indicators_meta meta ON meta.id = comments.metaId
                            LEFT JOIN ${indicatorName}_data qcd ON qcd.id = evaluations.indicator_view_id 
                        WHERE
                            comments.detail IS NOT NULL
                            AND qcd.result_code IN (
                                SELECT
                                    qcd2.result_code
                                FROM
                                    ${indicatorName} qcd2
                                    JOIN qa_evaluations qe ON qe.indicator_view_id = qcd2.id
                                WHERE
                                    qe.indicator_view_id = qcd2.id
                                    AND qe.id = :evaluationId
                            )
                            AND (
                                evaluations.evaluation_status <> 'Deleted'
                                OR evaluations.evaluation_status IS NULL
                            )
                            AND comments.approved = 1
                            AND comments.is_visible = 1
                            AND comments.is_deleted = 0
                            AND comments.approved_no_comment IS NULL
                        GROUP BY
                            evaluations.phase_year,
                            comments.detail,
                            comments.id,
                            replies.createdAt,
                            replies.updatedAt,
                            replies.detail,
                            replies.userId
                        ORDER BY
                            evaluations.phase_year ASC,
                            comments.createdAt ASC;
                            `,
              { evaluationId },
              {}
            );
          comments = await queryRunner.connection.query(query, parameters);
        }
      }
      res.status(200).send(comments);
    } catch (error) {
      res.status(404).json({ message: "Comments not found.", data: error });
    }
  };

  static toggleApprovedNoComments = async (req: Request, res: Response) => {
    const { evaluationId } = req.params;
    const { meta_array, userId, isAll, noComment } = req.body;
    let comments;
    const userRepository = getRepository(QAUsers);
    const evaluationsRepository = getRepository(QAEvaluations);
    const commentsRepository = getRepository(QAComments);
    const cycleRepo = getRepository(QACycle);

    try {
      const comments = await commentsRepository
        .createQueryBuilder("qc")
        .leftJoinAndSelect("qc.meta", "meta")
        .where("qc.evaluationId = :evaluationId", { evaluationId })
        .andWhere("qc.metaId IN (:meta_array)", { meta_array })
        .andWhere("qc.approved_no_comment IS NOT NULL")
        .getMany();

      let user = await userRepository.findOneOrFail({ where: { id: userId } });

      let evaluation = await evaluationsRepository.findOne({
        where: { id: evaluationId },
      });

      let current_cycle = await cycleRepo
        .createQueryBuilder("qa_cycle")
        .select("*")
        .where("DATE(qa_cycle.start_date) <= CURDATE()")
        .andWhere("DATE(qa_cycle.end_date) > CURDATE()")
        .getRawOne();

      const assessed_by = await getConnection()
        .createQueryBuilder()
        .select()
        .from("qa_evaluations_assessed_by_qa_users", "qaed")
        .where("qaEvaluationsId = :evaluationId", { evaluationId })
        .andWhere("qaUsersId = :userId", { userId })
        .execute();

      if (assessed_by.length <= 0) {
        const insertAssessedBy = await getConnection()
          .createQueryBuilder()
          .insert()
          .into("qa_evaluations_assessed_by_qa_users")
          .values({
            qaEvaluationsId: evaluationId,
            qaUsersId: userId,
          })
          .execute();
      }

      let response = [];

      for (let index = 0; index < meta_array.length; index++) {
        let comment_ = new QAComments();

        if (
          comments &&
          comments.find((comment) => comment.meta.id == meta_array[index])
        ) {
          let existnCommt = comments.find(
            (comment) => comment.meta.id == meta_array[index]
          );

          existnCommt.approved = noComment;
          existnCommt.is_deleted = !noComment;
          existnCommt.evaluation = evaluation;
          existnCommt.detail = null;
          existnCommt.approved_no_comment = noComment;
          existnCommt.user = user;
          comment_ = existnCommt;
        } else {
          comment_.approved = noComment;
          comment_.is_deleted = !noComment;
          comment_.evaluation = evaluation;
          comment_.meta = meta_array[index];
          comment_.detail = null;
          comment_.approved_no_comment = noComment;
          comment_.user = user;
          if (current_cycle == undefined)
            throw new Error("Could not created comment");
          comment_.cycle = current_cycle;
        }
        response.push(comment_);
      }
      let result = await commentsRepository.save(response);

      res.status(200).send({ data: result, message: "Comment toggle" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comments not setted as approved.", data: error });
    }
  };

  static getRawCommentsData = async (req: Request, res: Response) => {
    const { crp_id } = req.params;
    let rawData;
    const queryRunner = getConnection().createQueryBuilder();
    const userRepository = getRepository(QAUsers);

    try {
      if (crp_id !== undefined && crp_id !== "undefined") {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                    SELECT
                    (
                        SELECT
                        acronym
                        FROM
                                    qa_crp
                                    WHERE
                                    crp_id = evaluations.crp_id
                                    ) AS 'crp_acronym',
                                    evaluations.indicator_view_id AS 'indicator_view_id',
                                    (SELECT name  FROM qa_indicators WHERE id IN (( SELECT indicatorId FROM qa_indicators_meta WHERE id = comments.metaId) ) ) AS 'indicator_view_display',
                                    (SELECT view_name  FROM qa_indicators WHERE id IN (( SELECT indicatorId FROM qa_indicators_meta WHERE id = comments.metaId) ) ) AS 'indicator_view_name',
                                    ( SELECT display_name FROM qa_indicators_meta WHERE id = comments.metaId) AS 'field_name',
                                    comments.id AS 'comment_id',
                                    (SELECT username FROM qa_users WHERE id = comments.userId) as 'assessor_username',
                                    comments.detail AS 'comment_detail',
                            ( SELECT GROUP_CONCAT(detail) FROM qa_comments_replies WHERE commentId = comments.id ) as 'crp_comment',
                            SUM(IF(replies.userId = 47, 1, 0)) AS 'comment_auto_replied',
                            (SELECT cycle_stage from qa_cycle WHERE id = comments.cycleId) as 'cycle',
                            
                            
                            IF(comments.crp_approved IS NULL , 'Pending', IF(comments.crp_approved = 1, 'Aproved', 'Rejected')) AS 'reply_status',
                            
                            
                            
                            
                            SUM(
                                
                                IF (
                                    comments.crp_approved = 1,
                                    1,
                                    0
                                    )
                                    ) AS 'comment_approved',
                                    SUM(
                                        
                                        IF (
                                            comments.crp_approved = 0,
                                            1,
                                    0
                                    )
                            ) AS 'comment_rejected',
                            SUM(
                                
                                IF (
                                    comments.crp_approved IS NULL,
                                    1,
                                    0
                                    )
                                    ) AS 'comment_no_answer'
                        FROM
                        qa_comments comments
                        LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId AND evaluations.crp_id = :crp_id AND evaluations.status <> 'Deleted'
                        LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
                        WHERE
                        comments.is_deleted = 0
                        AND comments.detail IS NOT NULL
                        AND metaId IS NOT NULL
                        AND evaluation_status <> 'Deleted'
                        
                        
                        GROUP BY
                        evaluations.crp_id,
                            'field_name',
                            'cycle',
                            comments.id
                        ORDER BY
                        evaluations.crp_id,
                        indicator_view_id;
                        
                    `,
            { crp_id },
            {}
          );

        rawData = await queryRunner.connection.query(query, parameters);
      } else {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                        SELECT
                        (
                                SELECT
                                acronym
                                FROM
                                qa_crp
                                WHERE
                                crp_id = evaluations.crp_id
                                ) AS 'crp_acronym',
                                evaluations.indicator_view_id AS 'indicator_view_id',
                                (SELECT name  FROM qa_indicators WHERE id IN (( SELECT indicatorId FROM qa_indicators_meta WHERE id = comments.metaId) ) ) AS 'indicator_view_display',
                                (SELECT view_name  FROM qa_indicators WHERE id IN (( SELECT indicatorId FROM qa_indicators_meta WHERE id = comments.metaId) ) ) AS 'indicator_view_name',( SELECT display_name FROM qa_indicators_meta WHERE id = comments.metaId) AS 'field_name',
                                comments.id AS 'comment_id',
                                (SELECT username FROM qa_users WHERE id = comments.userId) as 'assessor_username',
                                comments.detail AS 'comment_detail',
                                ( SELECT GROUP_CONCAT(detail) FROM qa_comments_replies WHERE commentId = comments.id ) as 'crp_comment',
                                SUM(IF(replies.userId = 47, 1, 0)) AS 'comment_auto_replied',
                                (SELECT cycle_stage from qa_cycle WHERE id = comments.cycleId) as 'cycle',
                                
                                
                            IF(comments.crp_approved IS NULL , 'Pending', IF(comments.crp_approved = 1, 'Aproved', 'Rejected')) AS 'reply_status',
                            
                            
                            
                            
                            SUM(
                                
                                IF (
                                    comments.crp_approved = 1,
                                    1,
                                    0
                                    )
                                    ) AS 'comment_approved',
                                    SUM(
                                        
                                        IF (
                                            comments.crp_approved = 0,
                                            1,
                                            0
                                            )
                                            ) AS 'comment_rejected',
                                            SUM(
                                                
                                IF (
                                    comments.crp_approved IS NULL,
                                    1,
                                    0
                                    )
                                    ) AS 'comment_no_answer'
                                    FROM
                                    qa_comments comments
                                    LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId AND evaluations.status <> 'Deleted'
                                    LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
                                    WHERE
                                    comments.is_deleted = 0
                        AND comments.detail IS NOT NULL
                        AND metaId IS NOT NULL
                        AND evaluation_status <> 'Deleted'
                        
                        GROUP BY
                        evaluations.crp_id,
                        'field_name',
                        'cycle',
                        comments.id
                        ORDER BY
                        evaluations.crp_id,
                        indicator_view_id;
                        
                        `,
            {},
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      }

      res.status(200).json({ message: "Comments raw data", data: rawData });
    } catch (error) {
      res.status(404).json({ message: "Comments raw data error", data: error });
    }
  };

  static createTag = async (req: Request, res: Response) => {
    const { userId, tagTypeId, commentId } = req.body;

    const tagsRepository = getRepository(QATags);

    let tag = await tagsRepository.findOne({
      where: [{ commentId: commentId, userId: userId }],
    });
    if (tag) {
      tagsRepository.remove(tag);
    } else {
    }

    try {
      let new_tag = await Util.createTag(userId, tagTypeId, commentId);
      if (new_tag == null) throw new Error("Could not created tag");
      res.status(200).send({ data: new_tag, message: "Tag created" });
    } catch (error) {
      res.status(404).json({ message: "Tag can not be created.", data: error });
    }
  };

  static deleteTag = async (req: Request, res: Response) => {
    const { id } = req.params;

    const tagsRepository = getRepository(QATags);
    let tag: QATags;
    try {
      tag = await tagsRepository.findOneOrFail(id);
    } catch (error) {
      res.status(400).json({ message: "Tag not found." });
    }
    tagsRepository.delete(id);

    res.status(200).json({ message: "Tag deleted sucessfully" });
  };

  static getTagId = async (req: Request, res: Response) => {
    const { commentId, tagTypeId, userId } = req.params;

    let queryRunner = getConnection().createQueryBuilder();
    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `SELECT tag.id as tagId
                FROM qa_tags tag 
                JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                JOIN qa_users us ON us.id = tag.userId
                WHERE tag.commentId = :commentId
                AND tag.tagTypeId= :tagTypeId
                AND tag.userId= :userId;
                        `,
          { commentId, tagTypeId, userId },
          {}
        );

      let tagId = await queryRunner.connection.query(query, parameters);
      res.status(200).send({ data: tagId, message: "Tag id found" });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Tag id can not be found.", data: error });
    }
  };

  static getRawCommentsExcel = async (req: Request, res: Response) => {
    const { crp_id } = req.params;
    let rawData;
    const queryRunner = getConnection().createQueryBuilder();

    try {
      if (crp_id !== undefined && crp_id !== "undefined") {
        console.log("Si");

        const comments = `
        SELECT
            evaluations.crp_id AS 'Initiative ID',
            (
                SELECT
                    action_area
                FROM
                    qa_crp
                WHERE
                    crp_id = evaluations.crp_id
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
            AND evaluations.crp_id = '${crp_id}'
        GROUP BY
            evaluations.crp_id,
            'display_name',
            'cycle_stage',
            comments.id
        ORDER BY
            evaluations.crp_id,
            indicator_view_id;
          `;

        const evaluation = `
        SELECT
            evaluations.crp_id AS 'Initiative ID',
            (
                SELECT
                    name
                FROM
                    qa_indicators
                WHERE
                    view_name = evaluations.indicator_view_name
            ) AS 'Indicator type',
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
            END AS 'Result code',
            evaluations.evaluation_status AS 'Result status',
            CASE
                evaluations.status
                WHEN 'pending' THEN 'Pending'
                WHEN 'autochecked' THEN 'Automatically Validated'
                WHEN 'finalized' THEN 'Quality assessed'
                WHEN 'qa_capdev' THEN qcd.result_code
                ELSE NULL
            END AS 'Evaluation status',
            IFNULL (
                (
                    SELECT
                        GROUP_CONCAT(
                            DISTINCT qu.name SEPARATOR '\n'
                        ) 
                    FROM
                        qa_comments qc
                        LEFT JOIN qa_users qu ON qu.id = qc.userId
                    WHERE
                        qc.evaluationId = evaluations.id
                        AND qc.is_deleted = 0
                ),
                '~'
            ) AS 'Assessed by',
            CASE
                evaluations.indicator_view_name
                WHEN 'qa_other_output' THEN qood2.title
                WHEN 'qa_innovation_development' THEN qidd.title
                WHEN 'qa_knowledge_product' THEN qkp.title
                WHEN 'qa_capdev' THEN qcd.title
                WHEN 'qa_impact_contribution' THEN qicd.title
                WHEN 'qa_other_outcome' THEN qood.title
                WHEN 'qa_innovation_use' THEN qiud.title
                WHEN 'qa_policy_change' THEN qpcd.title
                WHEN 'qa_innovation_use_ipsr' THEN qiuid.title
                ELSE NULL
            END AS 'Result title'
        FROM
            qa_evaluations evaluations
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
            evaluations.phase_year = actual_phase_year()
            AND evaluations.crp_id = '${crp_id}'
            AND evaluations.batchDate >= actual_batch_date()
        ORDER BY
            evaluations.crp_id ASC;`;

        const query1 = await queryRunner.connection.query(comments);
        const query2 = await queryRunner.connection.query(evaluation);
        rawData = [query1, query2];
      } else {
        console.log("No");
        const comments = `
        SELECT
            evaluations.crp_id AS 'Initiative ID',
            (
                SELECT
                    action_area
                FROM
                    qa_crp
                WHERE
                    crp_id = evaluations.crp_id
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
        GROUP BY
            evaluations.crp_id,
            'display_name',
            'cycle_stage',
            comments.id
        ORDER BY
            evaluations.crp_id,
            indicator_view_id;`;

        const evaluation = `
        SELECT
            evaluations.crp_id AS 'Initiative ID',
            (
                SELECT
                    name
                FROM
                    qa_indicators
                WHERE
                    view_name = evaluations.indicator_view_name
            ) AS 'Indicator type',
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
            END AS 'Result code',
            evaluations.evaluation_status AS 'Result status',
            CASE
                evaluations.status
                WHEN 'pending' THEN 'Pending'
                WHEN 'autochecked' THEN 'Automatically Validated'
                WHEN 'finalized' THEN 'Quality assessed'
                WHEN 'qa_capdev' THEN qcd.result_code
                ELSE NULL
            END AS 'Evaluation status',
            IFNULL (
                (
                    SELECT
                        GROUP_CONCAT(
                            DISTINCT qu.name SEPARATOR '\n'
                        ) 
                    FROM
                        qa_comments qc
                        LEFT JOIN qa_users qu ON qu.id = qc.userId
                    WHERE
                        qc.evaluationId = evaluations.id
                        AND qc.is_deleted = 0
                ),
                '~'
            ) AS 'Assessed by',
            CASE
                evaluations.indicator_view_name
                WHEN 'qa_other_output' THEN qood2.title
                WHEN 'qa_innovation_development' THEN qidd.title
                WHEN 'qa_knowledge_product' THEN qkp.title
                WHEN 'qa_capdev' THEN qcd.title
                WHEN 'qa_impact_contribution' THEN qicd.title
                WHEN 'qa_other_outcome' THEN qood.title
                WHEN 'qa_innovation_use' THEN qiud.title
                WHEN 'qa_policy_change' THEN qpcd.title
                WHEN 'qa_innovation_use_ipsr' THEN qiuid.title
                ELSE NULL
            END AS 'Result title'
        FROM
            qa_evaluations evaluations
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
            evaluations.phase_year = actual_phase_year()
            AND evaluations.batchDate >= actual_batch_date()
        ORDER BY
            evaluations.crp_id ASC;`;
        const query1 = await queryRunner.connection.query(comments);
        const query2 = await queryRunner.connection.query(evaluation);
        rawData = [query1, query2];
      }
      res.status(200).send(rawData);
    } catch (error) {
      res.status(404).json({ message: "Comments raw data error", data: error });
    }
  };

  static getCycles = async (req: Request, res: Response) => {
    let rawData;
    const queryRunner = getConnection().createQueryBuilder().connection;

    try {
      const [query, parameters] =
        await queryRunner.driver.escapeQueryWithParameters(
          `
                    SELECT * FROM qa_cycle
                `,
          {},
          {}
        );
      rawData = await queryRunner.query(query, parameters);
      res.status(200).json({ message: "Cycles data", data: rawData });
    } catch (error) {
      res.status(404).json({ message: "Could not get cycles", data: error });
    }
  };

  static updateCycle = async (req: Request, res: Response) => {
    let { id, end_date, start_date } = req.body;
    let rawData;
    const cycleRepo = getRepository(QACycle);
    const queryRunner = getConnection().createQueryBuilder();
    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
                    SELECT * FROM qa_cycle WHERE id = :id
                `,
          { id },
          {}
        );
      rawData = await queryRunner.connection.query(query, parameters);

      rawData[0].end_date = end_date;
      rawData[0].start_date = start_date;

      let r = await cycleRepo.save(rawData[0]);
      res.status(200).json({ message: "Cycle updated", data: r });
    } catch (error) {
      res.status(404).json({ message: "Could not update cycle", data: error });
    }
  };

  static getIndicatorKeywords = async (req: Request, res: Response) => {
    const { crp_id, view_name } = req.params;
    let rawData;
    const queryRunner = getConnection().createQueryBuilder();
    const userRepository = getRepository(QAUsers);

    try {
      if (crp_id !== undefined && crp_id !== "undefined") {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            `
                    SELECT
                            (SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments WHERE metaId = meta.id AND evaluationId IN (SELECT id FROM qa_evaluations WHERE crp_id = :crp_id AND evaluation_status <> 'Deleted') ) AS 'comment_detail',
                            (SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments_replies WHERE commentId IN (SELECT id FROM qa_comments  WHERE metaId = meta.id AND evaluationId IN (SELECT id FROM qa_evaluations WHERE crp_id = :crp_id AND evaluation_status <> 'Deleted')) ) AS 'crp_comment_detail',
                            meta.col_name,
                            meta.order, 
                            meta.display_name
                    FROM
                            qa_indicators_meta meta
                    WHERE meta.indicatorId IN (SELECT id FROM qa_indicators WHERE view_name = :view_name)
                    AND meta.include_detail = 1

                    `,
            { crp_id, view_name },
            {}
          );

        rawData = await queryRunner.connection.query(query, parameters);
      } else {
        const [query, parameters] =
          await queryRunner.connection.driver.escapeQueryWithParameters(
            ` 
                    SELECT
                            (SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments WHERE metaId = meta.id ) AS 'comment_detail',
                            (SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments_replies WHERE commentId IN (SELECT id FROM qa_comments  WHERE metaId = meta.id) ) AS 'crp_comment_detail',
                            meta.col_name,
                            meta.order, 
                            meta.display_name
                    FROM
                            qa_indicators_meta meta
                    WHERE meta.indicatorId IN (SELECT id FROM qa_indicators WHERE view_name = :view_name)
                    AND meta.include_detail = 1

                    `,
            { view_name },
            {}
          );
        rawData = await queryRunner.connection.query(query, parameters);
      }

      res
        .status(200)
        .json({ message: "Comments keywords data", data: rawData });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Comments keywords data error", data: error });
    }
  };

  /*
   **
   */
  private static async getCommts(metaId, evaluationId) {
    const commentsRepository = getRepository(QAComments);

    let whereClause = {};
    if (metaId) {
      whereClause = {
        meta: metaId,
        evaluation: evaluationId,
        approved_no_comment: IsNull(),
      };
    } else {
      whereClause = {
        evaluation: evaluationId,
        approved_no_comment: IsNull(),
      };
    }

    let comments = await commentsRepository.find({
      where: whereClause,
      relations: ["user", "cycle", "tags", "replyType"],
      order: {
        createdAt: "ASC",
      },
    });

    return comments;
  }

  private apiOn(event) {
    return new Promise((resolve) => {});
  }

  static getQuickComments = async (req: Request, res: Response) => {
    let rawData;
    const queryRunner = getConnection().createQueryBuilder();

    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
                    SELECT * FROM qa_quick_comments
                    `,
          {},
          {}
        );
      rawData = await queryRunner.connection.query(query, parameters);
      res
        .status(200)
        .json({ message: "List of quick comments", data: rawData });
    } catch (error) {
      res
        .status(404)
        .json({ message: "Could not get list of quick comments", data: error });
    }
  };

  static getBatches = async (req: Request, res: Response) => {
    let rawData;
    const queryRunner = getConnection().createQueryBuilder();

    try {
      const [query, parameters] =
        await queryRunner.connection.driver.escapeQueryWithParameters(
          `
                    SELECT * FROM qa_batch order by batch_name asc
                    `,
          {},
          {}
        );
      rawData = await queryRunner.connection.query(query, parameters);

      let batches = [];

      for (let i = 0; i < rawData.length; i++) {
        const element = { submission_date: rawData[i] };
      }
      res.status(200).json({ message: "batches data", data: rawData });
    } catch (error) {
      res.status(404).json({ message: "Could not get batches", data: error });
    }
  };
}

export default CommentController;
