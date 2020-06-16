import e, { Request, Response } from "express";
import { validate } from "class-validator";
import { getRepository, In, getConnection, IsNull, Not } from "typeorm";

import { QAUsers } from "@entity/User";
import { QAComments } from "@entity/Comments";
import { QACommentsMeta } from "@entity/CommentsMeta";

import Util from "@helpers/Util"
import { QACommentsReplies } from "@entity/CommentsReplies";
import { RolesHandler } from "@helpers/RolesHandler";
import { QAIndicatorsMeta } from "@entity/IndicatorsMeta";
import { QAEvaluations } from "@entity/Evaluations";
import { QACycle } from "@entity/Cycles";


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


            if (role === RolesHandler.crp) {
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
                    AND  comments.approved = 1
                    GROUP BY evaluations.indicator_view_name, indicators.order
                    ORDER BY indicators.order
                        `,
                    { crp_id },
                    {}
                );
                console.log('role === RolesHandler.crp', query)
                rawData = await queryRunner.connection.query(query, parameters);
            } else {

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
                    console.log('!== undefined', query)
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
                    console.log('=== undefined', query)
                    rawData = await queryRunner.connection.query(query, parameters);
                }
            }



            res.status(200).json({ data: Util.parseChartData(rawData, (role !== RolesHandler.crp) ? 'admin' : 'crp'), message: 'Comments statistics' });
            // res.status(200).json({ data: rawData, message: 'Comments statistics' });

        } catch (error) {
            console.log(error);
            res.status(404).json({ message: "Could not access to comments statistics." });
        }

        // console.log( crp_id, id)
        // res.status(200).send()
    }

    // create reply by comment
    static createCommentReply = async (req: Request, res: Response) => {

        //Check if username and password are set
        const { detail, userId, commentId, crp_approved, approved } = req.body;
        // const evaluationId = req.params.id;

        const userRepository = getRepository(QAUsers);
        const commentReplyRepository = getRepository(QACommentsReplies);
        const commentsRepository = getRepository(QAComments);

        try {

            let user = await userRepository.findOneOrFail({ where: { id: userId } });
            let comment = await commentsRepository.findOneOrFail({ where: { id: commentId } });
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
            // console.log(new_replay)
            res.status(200).send({ data: new_replay, message: 'Comment created' });

        } catch (error) {
            console.log(error);
            res.status(404).json({ message: "Comment can not be created.", data: error });
        }
    }

    // create comment by indicator
    static createComment = async (req: Request, res: Response) => {
        // approved
        //Check if username and password are set
        const { detail, approved, userId, metaId, evaluationId } = req.body;

        try {
            let new_comment = await Util.createComment(detail, approved, userId, metaId, evaluationId);
            res.status(200).send({ data: new_comment, message: 'Comment created' });

        } catch (error) {
            console.log(error);
            res.status(404).json({ message: "Comment can not be created.", data: error });
        }
    }

    // update comment by indicator
    static updateComment = async (req: Request, res: Response) => {

        //Check if username and password are set
        const { approved, is_visible, is_deleted, id, detail, userId } = req.body;
        const commentsRepository = getRepository(QAComments);

        try {
            let comment_ = await commentsRepository.findOneOrFail(id);
            comment_.approved = approved;
            comment_.is_deleted = is_deleted;
            comment_.is_visible = is_visible;
            if (detail)
                comment_.detail = detail;
            if (userId)
                comment_.user = userId;


            let updated_comment = await commentsRepository.save(comment_);

            res.status(200).send({ data: updated_comment, message: 'Comment updated' });

        } catch (error) {
            console.log(error);
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
                console.log(reply_)
                let comment = await commentsRepository.findOneOrFail(reply_.comment.id);
                comment.crp_approved = null;

                commentsRepository.save(comment);
            }


            let updated_comment = await repliesRepository.save(reply_);

            res.status(200).send({ data: updated_comment, message: 'Reply updated' });

        } catch (error) {
            console.log(error);
            res.status(404).json({ message: "Reply can not be updated.", data: error });
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
                id, (
                    SELECT
                        COUNT(DISTINCT id)
                    FROM
                        qa_comments_replies
                    WHERE
                        commentId = qa_comments.id
                    AND is_deleted = 0
                ) AS replies_count
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
            }
            res.status(200).send({ data: comments, message: 'All comments' });

        } catch (error) {
            console.log(error);
            res.status(404).json({ message: "Comments can not be retrived.", data: error });
        }

    }

    // get comments replies
    static getCommentsReplies = async (req: Request, res: Response) => {
        const commentId = req.params.commentId;

        // let queryRunner = getConnection().createQueryBuilder();
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
            console.log(error);
            res.status(404).json({ message: "Comment can not be retrived.", data: error });
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
            console.log(error)
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
            // console.log(commentMeta, enable, isActive)
            commentMeta[enable] = isActive;
            // console.log(commentMeta, 'after')

            //Validade if the parameters are ok
            const errors = await validate(commentMeta);
            if (errors.length > 0) {
                res.status(400).json({ data: errors, message: "Error found" });
                return;
            }

            // update indicator by user
            commentMeta = await commentMetaRepository.save(commentMeta);
            // console.log(commentMeta)

        } catch (error) {
            console.log(error)
            //If not found, send a 404 response
            res.status(404).json({ message: 'User indicator not found.', data: error });
            // throw new ErrorHandler(404, 'User not found.');
        }

        //If all ok, send 200 response
        res.status(200).json({ message: "User indicator updated", data: commentMeta });


    };

    //get comments in excel
    static getCommentsExcel = async (req: Request, res: Response) => {
        // const { name, id } = req.params;
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
            // console.log(evaluationId,indicatorName)
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
                        replies.createdAt AS reply_createdAt,
                        replies.updatedAt AS reply_updatedAt,
                        replies.detail AS reply,
                        (SELECT title FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS indicator_title,
                        (SELECT username FROM qa_users WHERE id = replies.userId) AS reply_user
                    FROM
                        qa_comments comments
                    LEFT JOIN qa_users users ON users.id = comments.userId
                    LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                    LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
                    LEFT JOIN qa_indicators_meta meta ON meta.id = comments.metaId
                    WHERE
                        comments.detail IS NOT NULL
                    AND evaluations.indicator_view_name = :indicatorName
                    AND (evaluations.evaluation_status <> 'Deleted' OR evaluations.evaluation_status IS NULL)
                    AND comments.approved = 1
                    AND comments.is_deleted = 0
                    AND evaluations.crp_id = :crp_id
                    ORDER BY createdAt ASC
                    `,
                    { crp_id, indicatorName },
                    {}
                );

                // console.log(parameters)
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
                            replies.createdAt AS reply_createdAt,
                            replies.updatedAt AS reply_updatedAt,
                            replies.detail AS reply,
                            (SELECT title FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS indicator_title,
                            (SELECT username FROM qa_users WHERE id = replies.userId) AS reply_user
                        FROM
                            qa_comments comments
                        LEFT JOIN qa_users users ON users.id = comments.userId
                        LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                        LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
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

                    // console.log(parameters)
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
                            replies.createdAt AS reply_createdAt,
                            replies.updatedAt AS reply_updatedAt,
                            replies.detail AS reply,
                            (SELECT title FROM ${indicatorName} WHERE id = evaluations.indicator_view_id) AS indicator_title,
                            (SELECT username FROM qa_users WHERE id = replies.userId) AS reply_user
                        FROM
                            qa_comments comments
                        LEFT JOIN qa_users users ON users.id = comments.userId
                        LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                        LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
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

                    // console.log(parameters)
                    comments = await queryRunner.connection.query(query, parameters);
                }
            }

            // console.log(comments)

            // evaluations.id AS evaluation_id,
            // meta.col_name,

            const stream: Buffer = await Util.createCommentsExcel([
                { header: 'Comment id', key: 'comment_id' },
                { header: 'Indicator id', key: 'id' },
                { header: 'Indicator Title', key: 'indicator_title' },
                { header: 'Field', key: 'field' },
                { header: 'User', key: 'user' },
                { header: 'Comment', key: 'comment' },
                { header: 'Created Date', key: 'createdAt' },
                { header: 'Updated Date', key: 'updatedAt' },
                { header: 'Accepted comment?', key: 'crp_approved' },
                { header: 'Comment reply', key: 'reply' },
                { header: 'User Replied', key: 'user_replied' },
                { header: 'Reply Date', key: 'reply_createdAt' },
                // { header: 'Public Link', key: 'public_link' },
            ], comments, 'comments');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${name}.xlsx`);
            res.setHeader('Content-Length', stream.length);
            res.status(200).send(stream);
            // res.status(200).send({ data: stream, message: 'File download' });
        } catch (error) {
            console.log('excel error', error)
            res.status(404).json({ message: 'Comments not found.', data: error });
        }



    }

    static toggleApprovedNoComments = async (req: Request, res: Response) => {
        const { evaluationId } = req.params;
        const { meta_array, userId, isAll, noComment } = req.body;
        let comments;
        let queryRunner = getConnection().createQueryBuilder();
        const userRepository = getRepository(QAUsers);
        const evaluationsRepository = getRepository(QAEvaluations);
        const commentsRepository = getRepository(QAComments);
        // console.log(meta_array)
        try {
            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                `SELECT
                    *
                FROM
                    qa_comments
                WHERE
                    evaluationId = :evaluationId
                AND metaId IN (:meta_array)
                AND approved_no_comment IS NOT NULL
                `,
                { meta_array, evaluationId },
                {}
            );
            comments = await queryRunner.connection.query(query, parameters);
            // console.log(comments.length, meta_array)
            let user = await userRepository.findOneOrFail({ where: { id: userId } });
            let evaluation = await evaluationsRepository.findOneOrFail({ where: { id: evaluationId } });
            let response = [];

            for (let index = 0; index < meta_array.length; index++) {
                let comment_ = new QAComments();
                console.log(comments.length, comments.find(data => data.metaId == meta_array[index]))
                if (comments && comments.find(data => data.metaId == meta_array[index])) {
                    let existnCommt = comments.find(data => data.metaId == meta_array[index]);
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
                }
                response.push(comment_)
            }
            let result = await commentsRepository.save(response);

            res.status(200).send({ data: result, message: 'Comment toggle' });

        } catch (error) {
            console.log(error)
            res.status(404).json({ message: 'Comments not setted as approved.', data: error });
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
            relations: ['user', 'cycle'],
            // relations: ['user'],
            order: {
                createdAt: "ASC"
            }
        });
        return comments;
    }
}

export default CommentController;