-- ALTER CAP SHARING TABLE MATERIALIZE
ALTER TABLE
    qa_capdev_data
ADD
    COLUMN submitted BOOLEAN NULL,
ADD
    COLUMN is_replicated BOOLEAN NULL,
ADD
    COLUMN action_area text,
ADD
    COLUMN impact_area_targets text,
ADD
    COLUMN sdg text,
ADD
    COLUMN number_of_people_trained text,
ADD
    COLUMN nutrition_tag_level text,
ADD
    COLUMN environmental_biodiversity_tag_level text,
ADD
    COLUMN poverty_tag_level text;