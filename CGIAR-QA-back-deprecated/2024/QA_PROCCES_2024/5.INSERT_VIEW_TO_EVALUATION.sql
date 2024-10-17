SET
    SQL_SAFE_UPDATES = 0;

SET
    group_concat_max_len = 25000;

-- POLICY CHANGE
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    'pending',
    'qa_policy_change',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_policy_change_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_policy_change'
    );

-- INNO USE
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    'pending',
    'qa_innovation_use',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_innovation_use_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_innovation_use'
    );

-- OTHER OUTCOME
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    'pending',
    'qa_other_outcome',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_other_outcome_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_other_outcome'
    );

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
        phase_year,
        batchDate
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
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_capdev_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
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

-- INNOVATION DEVELOPMENT
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    'pending',
    'qa_innovation_development',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-10-07 07:00:00'
FROM
    qa_innovation_development_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2024
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2024
            AND qa.indicator_view_name = 'qa_innovation_development'
    );

-- OTHER OUTPUT
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    'pending',
    'qa_other_output',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_other_output_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_other_output'
    );

-- IMPACT CONTRIBUTIONS
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    'pending',
    'qa_impact_contribution',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_impact_contribution_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.id IS NOT NULL
    AND cc.crp_id IS NOT NULL
    AND cc.in_qa = 1
    AND NOT EXISTS (
        SELECT
            1
        FROM
            qa_evaluations qa
        WHERE
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_impact_contribution'
    );

-- KNOWLEDGE PRODUCT
INSERT INTO
    qa_evaluations (
        indicator_view_id,
        status,
        indicator_view_name,
        crp_id,
        createdAt,
        updatedAt,
        evaluation_status,
        phase_year,
        batchDate
    )
SELECT
    cc.id,
    IF(
        (
            (
                cc.is_melia != 'Yes'
                AND cc.knowledge_product_type != 'Journal Article'
            )
        ),
        'autochecked',
        IF(
            (
                (
                    cc.knowledge_product_type = 'Journal Article'
                    AND (
                        cgspace_year = wos_year
                        AND is_isi_cgspace = 1
                        AND is_isi_cgspace is not null
                        AND is_peer_cgspace = 1
                        AND is_peer_cgspace is not null
                        AND is_isi_wos = 1
                        AND is_isi_wos is not null
                        AND is_peer_wos = 1
                        AND is_peer_wos is not NULL
                        AND accesibility_cgspace = accesibility_wos
                    )
                )
            ),
            'autochecked',
            'pending'
        )
    ),
    'qa_knowledge_product',
    cc.crp_id,
    SYSDATE() created,
    SYSDATE() updated,
    IF (
        (cc.is_replicated = 1),
        'Updated',
        'New'
    ),
    cc.phase_year,
    '2024-03-01 12:00:00'
FROM
    qa_knowledge_product_view cc
WHERE
    cc.phase_name = 'AR'
    AND cc.phase_year = 2023
    AND cc.included_AR = 'yes'
    AND cc.is_active = 1
    AND cc.in_qa = 1
    AND not exists (
        select
            1
        from
            qa_evaluations qa
        where
            qa.indicator_view_id = cc.id
            AND qa.phase_year = 2023
            AND qa.indicator_view_name = 'qa_knowledge_product'
    );