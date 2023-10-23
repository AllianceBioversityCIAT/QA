SET
    SQL_SAFE_UPDATES = 0;

SET
    group_concat_max_len = 25000;

-- CAP SHARING
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year
    )
SELECT
    cc.id,
    'pending',
    'qa_capdev',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year
FROM
    qa_capdev_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_capdev'
    );