-- Other output
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_other_output'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 8
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- Other outcome
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_other_outcome'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 4
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- Cap Sharing
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_capdev'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 5
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- Inno dev
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_innovation_development'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 7
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- Inno use
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_innovation_use'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 2
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- Impact
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_impact_contribution'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 9
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- KP
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_knowledge_product'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2024
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 6
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );

-- Policy change
UPDATE
    qa_evaluations e
    LEFT JOIN prdb.result r ON r.id = e.indicator_view_id
    LEFT JOIN prdb.result_type rt ON rt.id = r.result_type_id
SET
    e.evaluation_status = 'Type Changed',
    e.indicator_view_name = (
        SELECT
            qi.view_name
        FROM
            qa_indicators qi
        WHERE
            qi.name = rt.name COLLATE utf8_unicode_ci
    ),
    e.updatedAt = CURRENT_TIMESTAMP()
WHERE
    e.indicator_view_name = 'qa_policy_change'
    AND e.evaluation_status != 'Type Changed'
    AND e.phase_year = 2025
    AND e.indicator_view_id IN (
        SELECT
            r.id
        FROM
            prdb.result r
        WHERE
            r.result_type_id != 1
            AND r.is_active = 1
            AND r.version_id = 4
            AND r.in_qa = 1
            AND r.id = e.indicator_view_id
            AND r.last_action_type IS NOT NULL
    );