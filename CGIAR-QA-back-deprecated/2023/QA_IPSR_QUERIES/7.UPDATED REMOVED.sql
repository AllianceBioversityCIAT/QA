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

UPDATE
	qa_evaluations e
SET
	evaluation_status = 'Removed'
WHERE
	e.indicator_view_name = 'qa_other_output'
	AND evaluation_status != 'Removed'
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