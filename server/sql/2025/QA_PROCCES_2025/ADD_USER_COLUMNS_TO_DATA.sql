-- Add created_user_id, created_user_email, submitter_user_id, submitter_user_email as TEXT to qa_*_data tables only.

-- POLICY CHANGE
ALTER TABLE qa_policy_change_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- INNOVATION USE
ALTER TABLE qa_innovation_use_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- CAP DEV
ALTER TABLE qa_capdev_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- INNOVATION DEVELOPMENT
ALTER TABLE qa_innovation_development_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- OTHER OUTPUT
ALTER TABLE qa_other_output_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- OTHER OUTCOME
ALTER TABLE qa_other_outcome_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- IMPACT CONTRIBUTION
ALTER TABLE qa_impact_contribution_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- KNOWLEDGE PRODUCT
ALTER TABLE qa_knowledge_product_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;

-- INNOVATION USE IPSR
ALTER TABLE qa_innovation_use_ipsr_data
    ADD COLUMN created_user_id TEXT NULL,
    ADD COLUMN created_user_email TEXT NULL,
    ADD COLUMN submitter_user_id TEXT NULL,
    ADD COLUMN submitter_user_email TEXT NULL;
