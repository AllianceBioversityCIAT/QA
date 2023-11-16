SELECT
    evaluations.crp_id AS 'Initiative ID',
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
    ) as 'reply',
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
    ) AS user_replied,
    IF(
        comments.crp_approved IS NULL,
        'Pending',
        IF(comments.crp_approved = 1, 'Aproved', 'Rejected')
    ) AS 'reply_status',
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
    ) AS reply_createdAt
FROM
    qa_comments comments
    LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
    AND evaluations.status <> 'Deleted'
    LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id
    AND replies.is_deleted = 0
    LEFT JOIN qadb.qa_innovation_use_data qiud ON qiud.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_innovation_development_data qidd ON qidd.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_knowledge_product qkp ON qkp.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_capdev_data qcd ON qcd.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_impact_contribution_data qicd ON qicd.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_other_outcome_data qood ON qood.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_other_output_data qood2 ON qood2.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_policy_change_data qpcd ON qpcd.id = evaluations.indicator_view_id
    LEFT JOIN qadb.qa_innovation_use_ipsr_data qiuid ON qiuid.id = evaluations.indicator_view_id
WHERE
    comments.is_deleted = 0
    AND comments.detail IS NOT NULL
    AND evaluations.phase_year = actual_phase_year()
    AND evaluations.batchDate > '2023-11-01'
GROUP BY
    evaluations.crp_id,
    'display_name',
    'cycle_stage',
    comments.id
ORDER BY
    evaluations.crp_id,
    indicator_view_id;