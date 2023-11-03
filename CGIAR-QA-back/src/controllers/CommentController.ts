import e, { Request, Response } from "express";
import { validate } from "class-validator";
import { getRepository, In, getConnection, IsNull, Not, getTreeRepository, QueryBuilder, Repository } from "typeorm";

import { QAUsers } from "./../entity/User";
import { QAComments } from "./../entity/Comments";
import { QACommentsMeta } from "./../entity/CommentsMeta";

import Util from "./../_helpers/Util"
import { QACommentsReplies } from "./../entity/CommentsReplies";
import { RolesHandler } from "./../_helpers/RolesHandler";
import { QAEvaluations } from "./../entity/Evaluations";
import { QACycle } from "./../entity/Cycles";
import { QATags } from "./../entity/Tags";
import { QAReplyType } from "./../entity/ReplyType";
import { StatusHandler } from "../_helpers/StatusHandler";
const { htmlToText } = require('html-to-text');

// const vfile = require('to-vfile')
// const retext = require('retext')
// const pos = require('retext-pos')
// const keywords = require('retext-keywords')
// const toString = require('nlcst-to-string')


// import { QAIndicatorsMeta } from "./../entity/IndicatorsMeta";
// import { createSecretKey } from "crypto";


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

            if (crp_id !== undefined && crp_id !== 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                    `
                    SELECT
                            SUM(
                                IF (comments.replyTypeId = 1 AND replies.detail = '', 1, 0 )
                            ) AS comments_accepted_without_comment,
                            SUM(
                                IF (comments.replyTypeId = 4 AND replies.detail <> '', 1, 0 )
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
                                    comments.require_changes = 1 AND comments.tpb = 1 AND comments.ppu = 0,
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
                    
                            IF(comments.replyTypeId IS NULL, 'secondary', IF(comments.replyTypeId in(1,4), 'success','danger')) AS type,
                            
                            COUNT(DISTINCT comments.id) AS 'label',
                            COUNT(DISTINCT comments.id) AS 'value',
                            evaluations.indicator_view_name
                    FROM qa_comments comments
                            LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId AND evaluations.crp_id = :crp_id
                            LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
                    WHERE comments.is_deleted = 0
                            AND comments.detail IS NOT NULL
                            AND metaId IS NOT NULL
                            AND evaluation_status <> 'Deleted'
                            AND evaluations.phase_year = actual_phase_year()
                            -- AND cycleId IN (SELECT id FROM qa_cycle WHERE DATE(start_date) <= CURDATE() AND DATE(end_date) > CURDATE())
                    GROUP BY evaluations.indicator_view_name, comments.replyTypeId
                    ORDER BY type DESC;
                    `,
                    { crp_id },
                    {}
                );
                rawData = await queryRunner.connection.query(query, parameters);
            } else {

                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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

                /* 
                if (crp_id !== 'undefined') {
                     const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                         `
                         SELECT
                             COUNT( CASE comments.crp_approved  WHEN 1 THEN 1 ELSE NULL END) AS approved_comment_crp,
                             COUNT( CASE comments.crp_approved  WHEN 0 THEN 1 ELSE NULL END) AS rejected_comment_crp,
                             SUM( IF(ISNULL(comments.crp_approved) AND !ISNULL(comments.detail),1,NULL)) AS crp_no_commented,
                             COUNT( CASE comments.approved WHEN 1 THEN 1 ELSE NULL END) AS comments_total,
                             COUNT( comments.detail) AS assessor_comments,
                             COUNT(comments.approved_no_comment) AS approved_no_comment,
                             evaluations.indicator_view_name,
                             indicators.order AS orderBy
                         FROM
                                 qa_evaluations evaluations
                         LEFT JOIN qa_comments comments ON comments.evaluationId = evaluations.id
                         LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
                         
                         WHERE comments.is_deleted = 0
                         AND evaluations.crp_id = :crp_id
                         GROUP BY evaluations.indicator_view_name, indicators.order
                         ORDER BY indicators.order
                             `,
                         { crp_id },
                         {}
                     );
                     rawData = await queryRunner.connection.query(query, parameters);
                     // res.status(200).json({ data: Util.parseCommentData(rawData, 'indicator_view_name'), message: 'Comments by crp' });
                 }
                 else if (crp_id == 'undefined') {
 
                     const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                         `
                         SELECT
                             COUNT( CASE comments.crp_approved  WHEN 1 THEN 1 ELSE NULL END) AS approved_comment_crp,
                             COUNT( CASE comments.crp_approved  WHEN 0 THEN 1 ELSE NULL END) AS rejected_comment_crp,
                             SUM( IF(ISNULL(comments.crp_approved) AND !ISNULL(comments.detail),1,NULL)) AS crp_no_commented,
                             COUNT( CASE comments.approved WHEN 1 THEN 1 ELSE NULL END) AS comments_total,
                             COUNT( comments.detail) AS assessor_comments,
                             COUNT(comments.approved_no_comment) AS approved_no_comment,
                             evaluations.indicator_view_name,
                             indicators.order AS orderBy
                         FROM
                                 qa_evaluations evaluations
                         LEFT JOIN qa_comments comments ON comments.evaluationId = evaluations.id
                         LEFT JOIN qa_indicators indicators ON indicators.view_name = evaluations.indicator_view_name
                         
                         WHERE comments.is_deleted = 0
                         GROUP BY evaluations.indicator_view_name, indicators.order
                         ORDER BY indicators.order
                             `,
                         {},
                         {}
                     );
                     rawData = await queryRunner.connection.query(query, parameters);
                 }
                 */
            }

            res.status(200).json({ data: Util.groupBy(rawData, 'indicator_view_name'), message: 'Comments statistics' });

        } catch (error) {
            res.status(404).json({ message: "Could not access to comments statistics." });
        }
    }

    // create reply by comment
    static createCommentReply = async (req: Request, res: Response) => {

        //Check if username and password are set
        const { detail, userId, commentId, crp_approved, approved, replyTypeId } = req.body;
        // const evaluationId = req.params.id;

        const userRepository = getRepository(QAUsers);
        const commentReplyRepository = getRepository(QACommentsReplies);
        const commentsRepository = getRepository(QAComments);
        const replyTypeRepository = getRepository(QAReplyType);

        try {

            let user = await userRepository.findOneOrFail({ where: { id: userId } });
            let comment = await commentsRepository.findOneOrFail({ where: { id: commentId } });
            let replyType = await replyTypeRepository.findOneOrFail({ where: { id: replyTypeId } });
            comment.replyType = replyType;
            let reply = new QACommentsReplies();
            reply.detail = detail;
            reply.comment = comment;
            reply.user = user;

            let new_replay = await commentReplyRepository.save(reply);
            if (user.roles.find(x => x.description == RolesHandler.crp)) {
                comment.crp_approved = crp_approved;
                comment = await commentsRepository.save(comment);
            }
            // else if(user.roles.find(x => x.description == RolesHandler.admin)){
            //     comment.approved = approved;
            //     comment = await commentsRepository.save(comment);
            // }
            res.status(200).send({ data: new_replay, message: 'Comment created' });

        } catch (error) {
            res.status(404).json({ message: "Comment can not be created.", data: error });
        }
    }

    // create comment by indicator
    static createComment = async (req: Request, res: Response) => {
        // approved
        //Check if username and password are set
        const { detail, approved, userId, metaId, evaluationId, original_field, require_changes, tpb } = req.body;

        try {
            let new_comment = await Util.createComment(detail, approved, userId, metaId, evaluationId, original_field, require_changes, tpb);
            if (new_comment == null) throw new Error('Could not created comment');
            res.status(200).send({ data: new_comment, message: 'Comment created' });

        } catch (error) {
            res.status(404).json({ message: "Comment can not be created.", data: error });
        }
    }


    // update comment by indicator
    static updateComment = async (req: Request, res: Response) => {

        //Check if username and password are set
        const { approved, is_visible, is_deleted, id, detail, userId, require_changes, tpb } = req.body;
        const commentsRepository = getRepository(QAComments);
        const tagsRepository = getRepository(QATags);

        try {
            let comment_ = await commentsRepository.findOneOrFail(id, { relations: ["tags"] });
            if (is_deleted) {
                tagsRepository.remove(comment_.tags);
            }
            comment_.approved = approved;
            comment_.is_deleted = is_deleted;
            comment_.is_visible = is_visible;
            comment_.require_changes = require_changes;
            comment_.tpb = tpb;
            if (detail)
                comment_.detail = detail;
            if (userId)
                comment_.user = userId;



            let updated_comment = await commentsRepository.save(comment_);

            res.status(200).send({ data: updated_comment, message: 'Comment updated' });

        } catch (error) {
            res.status(404).json({ message: "Comment can not be updated.", data: error });
        }
    }

    // update reply to comment
    static updateCommentReply = async (req: Request, res: Response) => {

        //Check if username and password are set
        const { is_deleted, id, detail, userId } = req.body;
        const repliesRepository = getRepository(QACommentsReplies);

        try {

            let reply_ = await repliesRepository.findOneOrFail(id, { relations: ['comment'] });

            reply_.is_deleted = is_deleted;
            if (detail)
                reply_.detail = detail;
            if (userId)
                reply_.user = userId;
            if (reply_.is_deleted) {
                const commentsRepository = await getRepository(QAComments);
                let comment = await commentsRepository.findOneOrFail(reply_.comment.id);
                comment.crp_approved = null;
                comment.replyType = null;
                commentsRepository.save(comment);
            }


            let updated_comment = await repliesRepository.save(reply_);

            res.status(200).send({ data: updated_comment, message: 'Reply updated' });

        } catch (error) {
            res.status(404).json({ message: "Reply can not be updated.", data: error });
        }
    }


    // get total indicator tags for chart
    static getAllIndicatorTags = async (req: Request, res: Response) => {
        //TODO
        const { crp_id } = req.query;

        let queryRunner = getConnection().createQueryBuilder();
        try {
            let tagsByIndicators;
            if (crp_id !== 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                    `
                    ,
                    { crp_id },
                    {}
                );
                tagsByIndicators = await queryRunner.connection.query(query, parameters);
            } else {

                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                    `SELECT qe.indicator_view_name, tt.name as tagType, count(*) as total
                    FROM qa_tags tag 
                    LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                    LEFT JOIN qa_users us ON us.id = tag.userId
                    LEFT JOIN qa_comments  qc ON qc.id = tag.commentId
                    LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
                    WHERE tt.name not like "seen"
                    AND qe.phase_year = actual_phase_year()
                    GROUP BY qe.indicator_view_name, tt.name;
                    `
                    ,
                    {},
                    {}
                );
                tagsByIndicators = await queryRunner.connection.query(query, parameters);

            }
            res.status(200).send({ data: tagsByIndicators, message: 'All tags by indicator' });


        } catch (error) {
            res.status(404).json({ message: "Tags by indicators can not be retrived.", data: error });
        }
    }

    // get all QA recent tags
    static getFeedTags = async (req: Request, res: Response) => {

        const { indicator_view_name, tagTypeId } = req.query;

        let tags;
        let queryRunner = getConnection().createQueryBuilder();
        try {
            if (indicator_view_name !== 'undefined' && tagTypeId !== 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
            } else if (indicator_view_name !== 'undefined' && tagTypeId === 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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


            res.status(200).send({ data: tags, message: 'All new tags order by date (desc)' });

        } catch (error) {
            res.status(404).json({ message: "Recent tags can not be retrived.", data: error });
        }
    }

    // get comments by indicator
    static getComments = async (req: Request, res: Response) => {
        const evaluationId = req.params.evaluationId;
        const metaId = req.params.metaId;

        // const commentsRepository = getRepository(QAComments);
        let queryRunner = getConnection().createQueryBuilder();
        try {

            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                comment.replies = replies.find(reply => reply.id == comment.id)
                const commentId = comment.id;
                const [queryTags, parametersTag] = await queryRunner.connection.driver.escapeQueryWithParameters(
                    `SELECT tag.id as tag_id,tt.id as tag_type, tt.name as tag_name, us.name as user_name, us.id as userId
                        FROM qa_tags tag 
                        JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
                        JOIN qa_users us ON us.id = tag.userId
                        WHERE tag.commentId = :commentId;`,
                    { commentId },
                    {}
                );

                comment.tags = await queryRunner.connection.query(queryTags, parametersTag);
            }
            res.status(200).send({ data: comments, message: 'All comments' });

        } catch (error) {
            res.status(404).json({ message: "Comments can not be retrived.", data: error });
        }
    }

    // * Updated ppu status ---------------------------------------------------------------------------------------------------------------------
    static patchPpuChanges = async (req: Request, res: Response) => {
        const commentsRepository = getRepository(QAComments);
        const { ppu, commentReplyId } = req.body;
        let message: String;

        try {
            let commentReplyId_ = await commentsRepository.findOneOrFail(commentReplyId);
            commentReplyId_.ppu = ppu;

            if (ppu != 0) {
                const commentReplyId = await commentsRepository.save(commentReplyId_);
                message = `Require changes was marked done`;
                res.status(202).json({ reply_comment: commentReplyId, message: message });
            } else {
                const commentReplyId = await commentsRepository.save(commentReplyId_);
                message = 'Require changes was removed';
                res.status(202).json({ reply_comment: commentReplyId, message: message });
            }
        } catch (error) {
            res.status(400).json({ message: 'An error ocurred when try to mark require changes' });
        }

    }

    // * Updated require changes ---------------------------------------------------------------------------------------------------------------------
    static patchRequireChanges = async (req: Request, res: Response) => {
        const commentsRepository = getRepository(QAComments);
        const { require_changes, id } = req.body;
        let update_require_changes;
        let message: String;
        // let tpb = 1;

        try {
            let comment_ = await commentsRepository.findOneOrFail(id);

            if (require_changes != 0) {
                comment_.require_changes = require_changes;
                // comment_.tpb = tpb;
                update_require_changes = await commentsRepository.save(comment_);
                message = `The TPB instruction was successfully created with require changes`;
            } else {
                comment_.require_changes = 0;
                // comment_.tpb = tpb;
                update_require_changes = await commentsRepository.save(comment_);
                message = 'The TPB instruction was successfully created';
            }
            res.status(202).json({ data: update_require_changes, message: message });
        } catch (error) {
            res.status(400).json({ message: 'An error ocurred when try to mark require changes' });
        }

    }

    // * Updated highlight comment -----------------------------------------------------------------------------------------------------------------------
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
                updated_comment = await commentsRepository.update(id, { highlight_by: null, highlight_comment: 0 });
                message = `Highligh mark was removed in comment by ${userId.username}`;
            }

            res.status(201).send({ data: updated_comment, message: message });
        } catch (error) {
            res.status(500).json({ message: "Highlight comment can not be set.", data: error });
        }
    }

    // get comments replies
    static getCommentsReplies = async (req: Request, res: Response) => {
        const commentId = req.params.commentId;

        // let queryRunner = getConnection().createQueryBuilder();
        if (commentId != undefined && commentId != null) {
            try {
                let replies = await getRepository(QACommentsReplies).find(
                    {
                        where: [{
                            comment: commentId,
                            is_deleted: Not(1)
                        }],
                        relations: ['user'],
                        order: {
                            createdAt: "ASC"
                        }
                    }
                )
                res.status(200).send({ data: replies, message: 'All comments replies' });
            } catch (error) {
                res.status(404).json({ message: "Comment can not be retrived.", data: error });
            }
        } else {

            res.status(404).json({ message: "Comment can not be retrieved. Comment ID not provided", data: null });
        }
    }

    //create comment meta data
    static createcommentsMeta = async (req: Request, res: Response) => {

        const commentMetaRepository = getRepository(QACommentsMeta);
        let queryRunner = getConnection().createQueryBuilder();

        try {
            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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

            res.status(200).send({ data: response, message: 'Comments meta created' });
        } catch (error) {
            //If not found, send a 404 response
            res.status(404).json({ message: 'Comment meta was not created.', data: error });
            // throw new ErrorHandler(404, 'User not found.');
        }

        //If all ok, send 200 response
        // res.status(200).json({ message: "User indicator updated", data: commentMeta });


    };

    //edit comment meta data
    static editCommentsMeta = async (req: Request, res: Response) => {

        //Get the ID from the url
        const id = req.params.id;

        let { enable, isActive } = req.body;

        const commentMetaRepository = getRepository(QACommentsMeta);
        let commentMeta, updatedCommentMeta;

        try {
            commentMeta = await commentMetaRepository.createQueryBuilder('qa_comments_meta')
                .select('id, enable_crp, enable_assessor')
                .where("qa_comments_meta.indicatorId=:indicatorId", { indicatorId: id })
                // .getSql()
                .getRawOne()
            commentMeta[enable] = isActive;

            //Validade if the parameters are ok
            const errors = await validate(commentMeta);
            if (errors.length > 0) {
                res.status(400).json({ data: errors, message: "Error found" });
                return;
            }

            // update indicator by user
            commentMeta = await commentMetaRepository.save(commentMeta);

        } catch (error) {
            //If not found, send a 404 response
            res.status(404).json({ message: 'User indicator not found.', data: error });
            // throw new ErrorHandler(404, 'User not found.');
        }

        //If all ok, send 200 response
        res.status(200).json({ message: "User indicator updated", data: commentMeta });


    };

    //get comments in excel
    static getCommentsExcel = async (req: Request, res: Response) => {
        const { evaluationId } = req.params;
        const { userId, name, crp_id, indicatorName } = req.query;
        let queryRunner = getConnection().createQueryBuilder();

        let comments;
        try {
            const userRepository = getRepository(QAUsers);


            let user = await userRepository.findOneOrFail({
                where: [
                    { id: userId },
                ]
            });
            let currentRole = user.roles.map(role => { return role.description })[0];
            if (evaluationId == undefined || evaluationId == 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                    users.email,
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
                    const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                            users.email,
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
                            AND evaluations.id = :evaluationId
                            AND (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
                            AND comments.approved = 1
                            AND comments.is_visible = 1
                            AND comments.is_deleted = 0
                            ORDER BY createdAt ASC
                            `,
                        { evaluationId },
                        {}
                    );
                    comments = await queryRunner.connection.query(query, parameters);
                }
                else {
                    const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                            users.email,
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
                            AND evaluations.id = :evaluationId
                            AND (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
                            AND comments.approved = 1
                            AND comments.is_visible = 1
                            AND comments.is_deleted = 0
                            ORDER BY createdAt ASC
                            `,
                        { evaluationId },
                        {}
                    );
                    comments = await queryRunner.connection.query(query, parameters);
                }
            }
            res.status(200).send(comments);
            // const stream: Buffer = await Util.createCommentsExcel([
            //     { header: 'Comment id', key: 'comment_id' },
            //     { header: 'Result code', key: 'result_code' },
            //     { header: 'Indicator Title', key: 'indicator_title' },
            //     { header: 'Field', key: 'field' },
            //     { header: 'Value', key: 'value' },
            //     { header: 'User', key: 'user' },
            //     { header: 'Comment', key: 'comment' },
            //     { header: 'Cycle', key: 'cycle_stage' },
            //     { header: 'Created Date', key: 'createdAt' },
            //     { header: 'Updated Date', key: 'updatedAt' },
            //     { header: 'Accepted comment?', key: 'crp_approved' },
            //     { header: 'Comment reply', key: 'reply' },
            //     { header: 'User Replied', key: 'user_replied' },
            //     { header: 'Reply Date', key: 'reply_createdAt' },
            //     // { header: 'Public Link', key: 'public_link' },
            // ], comments, 'comments', indicatorName);
            // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            // res.setHeader('Content-Disposition', `attachment; filename=${name}.xlsx`);
            // res.setHeader('Content-Length', stream.length);
            // res.status(200).send(stream);
            // res.status(200).send({ data: stream, message: 'File download' });
        } catch (error) {
            res.status(404).json({ message: 'Comments not found.', data: error });
        }



    }


    static toggleApprovedNoComments = async (req: Request, res: Response) => {


        //TODO - Improve performance
        const { evaluationId } = req.params;
        const { meta_array, userId, isAll, noComment } = req.body;
        let comments;
        // let queryRunner = getConnection().createQueryBuilder().connection;
        const userRepository = getRepository(QAUsers);
        const evaluationsRepository = getRepository(QAEvaluations);
        const commentsRepository = getRepository(QAComments);
        const cycleRepo = getRepository(QACycle);

        try {

            const comments = await commentsRepository
                .createQueryBuilder("qc")
                // .select("qc.metaId")
                .leftJoinAndSelect("qc.meta", "meta")
                .where("qc.evaluationId = :evaluationId", { evaluationId })
                .andWhere("qc.metaId IN (:meta_array)", { meta_array })
                .andWhere("qc.approved_no_comment IS NOT NULL")
                .getMany();


            // await getConnection()
            //     .createQueryBuilder()
            //     .select("*")
            //     .from(QAComments, "qc")
            //     .where("evaluationId = :evaluationId", {evaluationId})
            //     .andWhere("metaId IN (:meta_array)", {meta_array})
            //     .andWhere("approved_no_comment IS NOT NULL")
            //     .getMany();



            // const [query, parameters] = await queryRunner.driver.escapeQueryWithParameters(
            //     `SELECT
            //     *
            //     FROM
            //         qa_comments
            //         WHERE
            //         evaluationId = :evaluationId
            //         AND metaId IN (:meta_array)
            //         AND approved_no_comment IS NOT NULL
            //         `,
            //     { meta_array, evaluationId },
            //     {}
            // );
            // comments = await queryRunner.query(query, parameters);
            let user = await userRepository.findOneOrFail({ where: { id: userId } });

            let evaluation = await evaluationsRepository.findOne({ where: { id: evaluationId } });


            // let evaluation = await evaluationsRepository.findOneOrFail({ where: { id: evaluationId }});
            // evaluationsRepository.queryRunner.connection.close;

            let current_cycle = await cycleRepo
                .createQueryBuilder("qa_cycle")
                .select('*')
                .where("DATE(qa_cycle.start_date) <= CURDATE()")
                .andWhere("DATE(qa_cycle.end_date) > CURDATE()")
                .getRawOne();


            // TO-DO Assessed by per batch
            // if(current_cycle.id == 1) {
            //INSERT ASSESSED BY

            const assessed_by = await getConnection().createQueryBuilder()
                .select()
                .from("qa_evaluations_assessed_by_qa_users", "qaed")
                .where("qaEvaluationsId = :evaluationId", { evaluationId })
                .andWhere("qaUsersId = :userId", { userId })
                .execute();

            if (assessed_by.length <= 0) {
                const insertAssessedBy = await getConnection().createQueryBuilder()
                    .insert()
                    .into('qa_evaluations_assessed_by_qa_users')
                    .values({
                        qaEvaluationsId: evaluationId,
                        qaUsersId: userId
                    })
                    .execute();
            }



            // evaluation.assessed_by.push(user);
            // } else {
            //     evaluation.assessed_by_second_round.push(user);
            // }
            // evaluation.assessed_by.push(user);
            // evaluationsRepository.save(evaluation);

            let response = [];


            for (let index = 0; index < meta_array.length; index++) {
                let comment_ = new QAComments();

                if (comments && comments.find(comment => comment.meta.id == meta_array[index])) {
                    let existnCommt = comments.find(comment => comment.meta.id == meta_array[index]);

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
                    if (current_cycle == undefined) throw new Error('Could not created comment')
                    comment_.cycle = current_cycle;
                }
                response.push(comment_)
            }
            let result = await commentsRepository.save(response);

            res.status(200).send({ data: result, message: 'Comment toggle' });

        } catch (error) {
            res.status(404).json({ message: 'Comments not setted as approved.', data: error });
        }

    }


    //get raw comments data
    static getRawCommentsData = async (req: Request, res: Response) => {
        const { crp_id } = req.params;
        // const userId = res.locals.jwtPayload.userId;
        let rawData;
        const queryRunner = getConnection().createQueryBuilder();
        const userRepository = getRepository(QAUsers);

        try {

            if (crp_id !== undefined && crp_id !== 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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

                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
            res.status(404).json({ message: 'Comments raw data error', data: error });
        }
    }

    // create tag by comment
    static createTag = async (req: Request, res: Response) => {
        // approved
        //Check if username and password are set
        const { userId, tagTypeId, commentId } = req.body;

        const tagsRepository = getRepository(QATags);

        let tag = await tagsRepository.findOne({
            where: [
                { commentId: commentId, userId: userId },
            ]
        });
        if (tag) {
            tagsRepository.remove(tag);
        } else {
        }


        try {
            let new_tag = await Util.createTag(userId, tagTypeId, commentId);
            if (new_tag == null) throw new Error('Could not created tag');
            res.status(200).send({ data: new_tag, message: 'Tag created' });

        } catch (error) {
            res.status(404).json({ message: "Tag can not be created.", data: error });
        }
    }

    static deleteTag = async (req: Request, res: Response) => {
        //Get id from URL
        const { id } = req.params;


        const tagsRepository = getRepository(QATags);
        let tag: QATags;
        try {
            tag = await tagsRepository.findOneOrFail(id);
        } catch (error) {
            res.status(400).json({ message: 'Tag not found.' });
        }
        tagsRepository.delete(id);

        //After all send a 204 (no content, but accepted) response
        res.status(200).json({ message: "Tag deleted sucessfully" });
    }

    static getTagId = async (req: Request, res: Response) => {

        const { commentId, tagTypeId, userId } = req.params;

        let queryRunner = getConnection().createQueryBuilder();
        try {

            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
            res.status(200).send({ data: tagId, message: 'Tag id found' });

        } catch (error) {
            res.status(404).json({ message: "Tag id can not be found.", data: error });

        }

    }

    //get raw comments excel
    static getRawCommentsExcel = async (req: Request, res: Response) => {
        const { crp_id } = req.params;
        // const userId = res.locals.jwtPayload.userId;
        let rawData;
        const queryRunner = getConnection().createQueryBuilder();

        try {

            if (crp_id !== undefined && crp_id !== 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                        evaluations.indicator_view_id AS 'id',
                        
                        comments.createdAt AS createdAt,
                        comments.updatedAt AS updatedAt,
                        (SELECT name FROM qa_indicators WHERE view_name = evaluations.indicator_view_name) AS 'indicator_title',
                            evaluations.indicator_view_name AS 'indicator_view_name',
                            ( SELECT display_name FROM qa_indicators_meta WHERE id = comments.metaId) AS 'display_name',
                            ( SELECT col_name FROM qa_indicators_meta WHERE id = comments.metaId) AS 'col_name',
                            comments.id AS 'comment_id',
                            (SELECT username FROM qa_users WHERE id = comments.userId) as 'username',
                            comments.detail AS 'detail',
                            IFNULL(( SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id ),'<not replied>') as 'reply',
                            IFNULL(( SELECT  GROUP_CONCAT( (SELECT username from qa_users WHERE id = userId) SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id),'<not replied>') AS user_replied,
                            IFNULL(( SELECT  GROUP_CONCAT( createdAt SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id),'<not replied>') AS reply_createdAt,
                            SUM(IF(replies.userId = 47, 1, 0)) AS 'comment_auto_replied',
                            (SELECT cycle_stage from qa_cycle WHERE id = comments.cycleId) as 'cycle_stage',
                            comments.crp_approved AS crp_approved
                        FROM
                            qa_comments comments
                        LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId AND evaluations.status <> 'Deleted'
                        LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
                        WHERE comments.is_deleted = 0
                        AND comments.detail IS NOT NULL
                        AND evaluations.crp_id = :crp_id
                        AND evaluations.phase_year = actual_phase_year()
                        GROUP BY
                            evaluations.crp_id,
                            'display_name',
                            'cycle_stage',
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

                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
                    evaluations.indicator_view_id AS 'id',
                    
                    comments.createdAt AS createdAt,
                    comments.updatedAt AS updatedAt,
                    (SELECT name FROM qa_indicators WHERE view_name = evaluations.indicator_view_name) AS 'indicator_title',
                    evaluations.indicator_view_name AS 'indicator_view_name',
                    ( SELECT display_name FROM qa_indicators_meta WHERE id = comments.metaId) AS 'display_name',
                    ( SELECT col_name FROM qa_indicators_meta WHERE id = comments.metaId) AS 'col_name',
                    comments.id AS 'comment_id',
                    (SELECT username FROM qa_users WHERE id = comments.userId) as 'username',
                    comments.detail AS 'detail',
                    IFNULL(( SELECT GROUP_CONCAT(detail SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id and qa_comments_replies.is_deleted = 0),'<not replied>') as 'reply',
                    IFNULL(( SELECT  GROUP_CONCAT( (SELECT username from qa_users WHERE id = userId) SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id and qa_comments_replies.is_deleted = 0),'<not replied>') AS user_replied,
                    IFNULL(( SELECT  GROUP_CONCAT( createdAt SEPARATOR '\n') FROM qa_comments_replies WHERE commentId = comments.id and qa_comments_replies.is_deleted = 0),'<not replied>') AS reply_createdAt,
                    SUM(IF(replies.userId = 47, 1, 0)) AS 'comment_auto_replied',
                    (SELECT cycle_stage from qa_cycle WHERE id = comments.cycleId) as 'cycle_stage',
                    comments.crp_approved AS crp_approved
                    FROM
                        qa_comments comments
                    LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId AND evaluations.status <> 'Deleted'
                    LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
                    WHERE comments.is_deleted = 0
                    AND comments.detail IS NOT NULL
                    AND evaluations.phase_year = actual_phase_year()
                    
                    GROUP BY
                        evaluations.crp_id,
                        'display_name',
                        'cycle_stage',
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
            const stream: Buffer = await Util.createRawCommentsExcel([
                { header: 'CRP', key: 'crp_acronym' },
                { header: 'Comment id', key: 'comment_id' },
                { header: 'Indicator id', key: 'id' },
                { header: 'Indicator Title', key: 'indicator_title' },
                { header: 'Field', key: 'field' },
                { header: 'Value', key: 'value' },
                { header: 'Assessor', key: 'assessor' },
                { header: 'Comment', key: 'comment' },
                { header: 'Cycle', key: 'cycle_stage' },
                { header: 'Created Date', key: 'createdAt' },
                { header: 'Updated Date', key: 'updatedAt' },
                { header: 'Accepted comment?', key: 'crp_approved' },
                { header: 'Comment reply', key: 'reply' },
                { header: 'User Replied', key: 'user_replied' },
                { header: 'Reply Date', key: 'reply_createdAt' },
                // { header: 'Public Link', key: 'public_link' },
            ], rawData, 'comments');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=qa_raw_comments.xlsx`);
            res.setHeader('Content-Length', stream.length);
            res.status(200).send(stream);
            return;
            // res.status(200).json({ message: "Comments raw excel", data: rawData });
        } catch (error) {
            res.status(404).json({ message: 'Comments raw data error', data: error });
        }
    }

    //get cycles 
    static getCycles = async (req: Request, res: Response) => {
        let rawData;
        const queryRunner = getConnection().createQueryBuilder().connection;

        try {
            const [query, parameters] = await queryRunner.driver.escapeQueryWithParameters(
                `
                    SELECT * FROM qa_cycle
                `,
                {},
                {}
            );
            rawData = await queryRunner.query(query, parameters);
            res.status(200).json({ message: "Cycles data", data: rawData });
        } catch (error) {
            res.status(404).json({ message: 'Could not get cycles', data: error });
        }
    }

    static updateCycle = async (req: Request, res: Response) => {
        let { id, end_date, start_date } = req.body;
        let rawData;
        const cycleRepo = getRepository(QACycle);
        const queryRunner = getConnection().createQueryBuilder();
        try {

            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
            res.status(404).json({ message: 'Could not update cycle', data: error });
        }
    }










    //get keywords by indicator
    static getIndicatorKeywords = async (req: Request, res: Response) => {
        const { crp_id, view_name } = req.params;
        // const userId = res.locals.jwtPayload.userId;
        let rawData;
        const queryRunner = getConnection().createQueryBuilder();
        const userRepository = getRepository(QAUsers);

        try {

            if (crp_id !== undefined && crp_id !== 'undefined') {
                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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

                const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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

            // retext()
            //     .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
            //     .use(keywords)
            //     .process(vfile.readSync('example.txt'), done)



            res.status(200).json({ message: "Comments keywords data", data: rawData });
        } catch (error) {
            res.status(404).json({ message: 'Comments keywords data error', data: error });
        }
    }




    //
    /*
    **
    */
    private static async getCommts(metaId, evaluationId) {
        const commentsRepository = getRepository(QAComments);

        let whereClause = {}
        if (metaId) {
            whereClause = {
                meta: metaId, evaluation: evaluationId, approved_no_comment: IsNull()
            }

        } else {
            whereClause = {
                evaluation: evaluationId, approved_no_comment: IsNull()
            }
        }

        let comments = await commentsRepository.find({
            where: whereClause,
            relations: ['user', 'cycle', 'tags', 'replyType'],
            order: {
                createdAt: "ASC"
            }
        });

        return comments;
    }

    private apiOn(event) {
        return new Promise(resolve => {
            // api.on(event, response => resolve(response));
        });
    }

    //get QuickComments 
    static getQuickComments = async (req: Request, res: Response) => {
        let rawData;
        const queryRunner = getConnection().createQueryBuilder();

        try {
            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                `
                    SELECT * FROM qa_quick_comments
                    `,
                {},
                {}
            );
            rawData = await queryRunner.connection.query(query, parameters);
            res.status(200).json({ message: "List of quick comments", data: rawData });
        } catch (error) {
            res.status(404).json({ message: 'Could not get list of quick comments', data: error });
        }
    }

    //get batches 
    static getBatches = async (req: Request, res: Response) => {
        let rawData;
        const queryRunner = getConnection().createQueryBuilder();

        try {
            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
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
            res.status(404).json({ message: 'Could not get batches', data: error });
        }
    }
}

export default CommentController;