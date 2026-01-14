-- CREATE DATA TABLES FROM VIEWS
DROP TABLE IF EXISTS qa_capdev_data;
CREATE TABLE qa_capdev_data AS SELECT * FROM qa_capdev_view LIMIT 0;

DROP TABLE IF EXISTS qa_impact_contribution_data;
CREATE TABLE qa_impact_contribution_data AS SELECT * FROM qa_impact_contribution_view LIMIT 0;

DROP TABLE IF EXISTS qa_innovation_development_data;
CREATE TABLE qa_innovation_development_data AS SELECT * FROM qa_innovation_development_view LIMIT 0;

DROP TABLE IF EXISTS qa_innovation_use_data;
CREATE TABLE qa_innovation_use_data AS SELECT * FROM qa_innovation_use_view LIMIT 0;

DROP TABLE IF EXISTS qa_innovation_use_ipsr_data;
CREATE TABLE qa_innovation_use_ipsr_data AS SELECT * FROM qa_innovation_use_ipsr_view LIMIT 0;

DROP TABLE IF EXISTS qa_knowledge_product_data;
CREATE TABLE qa_knowledge_product_data AS SELECT * FROM qa_knowledge_product_view LIMIT 0;

DROP TABLE IF EXISTS qa_other_outcome_data;
CREATE TABLE qa_other_outcome_data AS SELECT * FROM qa_other_outcome_view LIMIT 0;

DROP TABLE IF EXISTS qa_other_output_data;
CREATE TABLE qa_other_output_data AS SELECT * FROM qa_other_output_view LIMIT 0;

DROP TABLE IF EXISTS qa_policy_change_data;
CREATE TABLE qa_policy_change_data AS SELECT * FROM qa_policy_change_view LIMIT 0;

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

-- CREATE VIEWS
DROP VIEW IF EXISTS qa_capdev;
CREATE VIEW qa_capdev AS SELECT * FROM qa_capdev_view;

DROP VIEW IF EXISTS qa_impact_contribution;
CREATE VIEW qa_impact_contribution AS SELECT * FROM qa_impact_contribution_view;

DROP VIEW IF EXISTS qa_innovation_development;
CREATE VIEW qa_innovation_development AS SELECT * FROM qa_innovation_development_view;

DROP VIEW IF EXISTS qa_innovation_use;
CREATE VIEW qa_innovation_use AS SELECT * FROM qa_innovation_use_view;

DROP VIEW IF EXISTS qa_innovation_use_ipsr;
CREATE VIEW qa_innovation_use_ipsr AS SELECT * FROM qa_innovation_use_ipsr_view;

DROP VIEW IF EXISTS qa_knowledge_product;
CREATE VIEW qa_knowledge_product AS SELECT * FROM qa_knowledge_product_view;

DROP VIEW IF EXISTS qa_other_outcome;
CREATE VIEW qa_other_outcome AS SELECT * FROM qa_other_outcome_view;

DROP VIEW IF EXISTS qa_other_output;
CREATE VIEW qa_other_output AS SELECT * FROM qa_other_output_view;

DROP VIEW IF EXISTS qa_policy_change;
CREATE VIEW qa_policy_change AS SELECT * FROM qa_policy_change_view;