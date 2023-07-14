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
    'qa_innovation_use_ipsr',
    cc.crp_id,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6),
    'Added',
    2023
FROM
    qa_innovation_use_ipsr_view cc
where
    cc.phase_name = 'AR'
    and cc.phase_year = 2023
    and cc.included_AR = 'yes'
    and cc.is_active = 1
    and cc.submitted = 1
    and not exists (
        select
            1
        from
            qa_evaluations qa
        where
            qa.indicator_view_id = cc.id
            and qa.phase_year = 2023
            and qa.indicator_view_name = 'qa_innovation_use_ipsr'
    );