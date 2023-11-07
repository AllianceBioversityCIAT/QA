-- ALTER POICY CHANGE TABLE MATERIALIZE
ALTER TABLE
    qa_policy_change_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT,
ADD
    COLUMN result_related TEXT;

-- ALTER INNO USE TABLE MATERIALIZE
ALTER TABLE
    qa_innovation_use_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT,
ADD
    COLUMN organizations TEXT,
ADD
    COLUMN other_quantitative TEXT;

-- ALTER OTHER OUTCOME TABLE MATERIALIZE
ALTER TABLE
    qa_other_output_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT;

-- ALTER CAP SHARING TABLE MATERIALIZE
ALTER TABLE
    qa_capdev_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN number_of_people_trained TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT;

-- ALTER INNO DEV TABLE MATERIALIZE
ALTER TABLE
    qa_innovation_development_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT,
ADD
    COLUMN questions TEXT,
ADD
    COLUMN initiatives_investment TEXT,
ADD
    COLUMN npp_investment TEXT,
ADD
    COLUMN partner_investment TEXT,
ADD
    COLUMN pictures TEXT,
ADD
    COLUMN materials TEXT;

-- ALTER OTHER OUTPUT TABLE MATERIALIZE
ALTER TABLE
    qa_other_output_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT;

-- ALTER IMPAC TABLE MATERIALIZE
ALTER TABLE
    qa_impact_contribution_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT;

-- ALTER KP TABLE MATERIALIZE
ALTER TABLE
    qa_knowledge_product_data
ADD
    COLUMN submitted BIGINT NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area TEXT,
ADD
    COLUMN impact_area_targets TEXT,
ADD
    COLUMN sdg TEXT,
ADD
    COLUMN nutrition_tag_level TEXT,
ADD
    COLUMN environmental_biodiversity_tag_level TEXT,
ADD
    COLUMN poverty_tag_level TEXT,
ADD
    COLUMN online_date TEXT;