-- CREATE DATA TABLES FROM VIEWS
DROP TABLE IF EXISTS qa_capdev_data;
CREATE TABLE qa_capdev_data AS SELECT * FROM qa_capdev LIMIT 0;

DROP TABLE IF EXISTS qa_impact_contribution_data;
CREATE TABLE qa_impact_contribution_data AS SELECT * FROM qa_impact_contribution LIMIT 0;

DROP TABLE IF EXISTS qa_innovation_development_data;
CREATE TABLE qa_innovation_development_data AS SELECT * FROM qa_innovation_development LIMIT 0;

DROP TABLE IF EXISTS qa_innovation_use_data;
CREATE TABLE qa_innovation_use_data AS SELECT * FROM qa_innovation_use LIMIT 0;

DROP TABLE IF EXISTS qa_innovation_use_ipsr_data;
CREATE TABLE qa_innovation_use_ipsr_data AS SELECT * FROM qa_innovation_use_ipsr LIMIT 0;

DROP TABLE IF EXISTS qa_knowledge_product_data;
CREATE TABLE qa_knowledge_product_data AS SELECT * FROM qa_knowledge_product LIMIT 0;

DROP TABLE IF EXISTS qa_other_outcome_data;
CREATE TABLE qa_other_outcome_data AS SELECT * FROM qa_other_outcome LIMIT 0;

DROP TABLE IF EXISTS qa_other_output_data;
CREATE TABLE qa_other_output_data AS SELECT * FROM qa_other_output LIMIT 0;

DROP TABLE IF EXISTS qa_policy_change_data;
CREATE TABLE qa_policy_change_data AS SELECT * FROM qa_policy_change LIMIT 0;

-- INITIAL
DROP TABLE IF EXISTS qa_capdev_data_initial;
CREATE TABLE qa_capdev_data_initial LIKE qa_capdev_data;

DROP TABLE IF EXISTS qa_impact_contribution_data_initial;
CREATE TABLE qa_impact_contribution_data_initial LIKE qa_impact_contribution_data;

DROP TABLE IF EXISTS qa_innovation_development_data_initial;
CREATE TABLE qa_innovation_development_data_initial LIKE qa_innovation_development_data;

DROP TABLE IF EXISTS qa_innovation_use_data_initial;
CREATE TABLE qa_innovation_use_data_initial LIKE qa_innovation_use_data;

DROP TABLE IF EXISTS qa_innovation_use_ipsr_data_initial;
CREATE TABLE qa_innovation_use_ipsr_data_initial LIKE qa_innovation_use_ipsr_data;

DROP TABLE IF EXISTS qa_knowledge_product_data_initial;
CREATE TABLE qa_knowledge_product_data_initial LIKE qa_knowledge_product_data;

DROP TABLE IF EXISTS qa_other_outcome_data_initial;
CREATE TABLE qa_other_outcome_data_initial LIKE qa_other_outcome_data;

DROP TABLE IF EXISTS qa_other_output_data_initial;
CREATE TABLE qa_other_output_data_initial LIKE qa_other_output_data;

DROP TABLE IF EXISTS qa_policy_change_data_initial;
CREATE TABLE qa_policy_change_data_initial LIKE qa_policy_change_data;