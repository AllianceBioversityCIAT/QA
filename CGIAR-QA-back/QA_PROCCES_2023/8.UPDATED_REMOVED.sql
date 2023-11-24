-- 1
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_other_output'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_other_output_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 2
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_other_outcome'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_other_outcome_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 3
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_capdev'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_capdev_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);
	
-- 4
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_innovation_development'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_innovation_development_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 5
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_innovation_use'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_innovation_use_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 6
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_impact_contribution'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_impact_contribution_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 7
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_knowledge_product'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_knowledge_product_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 8
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_policy_change'
	AND e.evaluation_status != 'Removed'
	AND e.phase_year = 2023
	AND NOT EXISTS (
		SELECT
			1
		FROM
			qa_policy_change_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.in_qa = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);

-- 9 IPSR
UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_innovation_use_ipsr'
	AND evaluation_status != 'Removed'
	AND not EXISTS (
		SELECT
			1
		FROM
			qa_innovation_use_ipsr_view o
		WHERE
			o.phase_name = 'AR'
			AND o.included_AR = 'yes'
			AND o.is_active = 1
			AND o.submitted = 1
			AND e.indicator_view_id = o.id
			AND o.phase_year = 2023
	);