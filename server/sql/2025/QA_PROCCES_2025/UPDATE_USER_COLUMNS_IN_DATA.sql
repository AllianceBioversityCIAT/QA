-- Update only created_user_id, created_user_email, submitter_user_id, submitter_user_email
-- in each qa_*_data for results that exist in qa_evaluations and have in_qa = 1 in the view.
SET SQL_SAFE_UPDATES = 0;

-- POLICY CHANGE
UPDATE qa_policy_change_data qa
JOIN qa_policy_change_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_policy_change'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- INNOVATION USE
UPDATE qa_innovation_use_data qa
JOIN qa_innovation_use_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_innovation_use'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- CAP DEV
UPDATE qa_capdev_data qa
JOIN qa_capdev_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_capdev'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- INNOVATION DEVELOPMENT
UPDATE qa_innovation_development_data qa
JOIN qa_innovation_development_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_innovation_development'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- OTHER OUTPUT
UPDATE qa_other_output_data qa
JOIN qa_other_output_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_other_output'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- OTHER OUTCOME
UPDATE qa_other_outcome_data qa
JOIN qa_other_outcome_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_other_outcome'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- IMPACT CONTRIBUTION
UPDATE qa_impact_contribution_data qa
JOIN qa_impact_contribution_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_impact_contribution'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- KNOWLEDGE PRODUCT
UPDATE qa_knowledge_product_data qa
JOIN qa_knowledge_product_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_knowledge_product'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;

-- INNOVATION USE IPSR
UPDATE qa_innovation_use_ipsr_data qa
JOIN qa_innovation_use_ipsr_view cc ON qa.id = cc.id
JOIN qa_evaluations e ON e.indicator_view_id = qa.id AND e.phase_year = 2025 AND e.indicator_view_name = 'qa_innovation_use_ipsr'
SET
    qa.created_user_id = cc.created_user_id,
    qa.created_user_email = cc.created_user_email,
    qa.submitter_user_id = cc.submitter_user_id,
    qa.submitter_user_email = cc.submitter_user_email
WHERE cc.in_qa = 1;
