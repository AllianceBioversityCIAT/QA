-- 2024
ALTER TABLE
    qa_capdev_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_impact_contribution_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_innovation_development_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_innovation_use_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_innovation_use_ipsr_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_knowledge_product_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_other_outcome_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_other_output_data
ADD
    COLUMN version INT NULL;

ALTER TABLE
    qa_policy_change_data
ADD
    COLUMN version INT NULL;

-- INITIAL
CREATE TABLE qa_capdev_data_initial LIKE qa_capdev_data;

CREATE TABLE qa_impact_contribution_data_initial LIKE qa_impact_contribution_data;

CREATE TABLE qa_innovation_development_data_initial LIKE qa_innovation_development_data;

CREATE TABLE qa_innovation_use_data_initial LIKE qa_innovation_use_data;

CREATE TABLE qa_innovation_use_ipsr_data_initial LIKE qa_innovation_use_ipsr_data;

CREATE TABLE qa_knowledge_product_data_initial LIKE qa_knowledge_product_data;

CREATE TABLE qa_other_outcome_data_initial LIKE qa_other_outcome_data;

CREATE TABLE qa_other_output_data_initial LIKE qa_other_output_data;

CREATE TABLE qa_policy_change_data_initial LIKE qa_policy_change_data;