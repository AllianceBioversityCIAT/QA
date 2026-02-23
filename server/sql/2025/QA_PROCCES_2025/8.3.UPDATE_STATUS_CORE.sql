UUPDATE qa_evaluations AS ev
SET
    ev.status = 'pending'
WHERE
    ev.id IN (
        SELECT
            id
        FROM
            (
                SELECT
                    DISTINCT evaluations.id
                FROM
                    qa_comments comments
                    LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
                    AND evaluations.status <> 'Deleted'
                    LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
                    AND replies.is_deleted = 0
                    LEFT JOIN qadb.qa_indicators qi ON qi.view_name = evaluations.indicator_view_name
                    LEFT JOIN qa_indicators_meta qim ON qim.id = comments.metaId
                WHERE
                    comments.is_deleted = 0
                    AND comments.detail IS NOT NULL
                    AND evaluations.phase_year = 2025
                    AND evaluations.batchDate >= actual_batch_date()
                    AND qim.is_core = 1
            ) AS subquery
    );