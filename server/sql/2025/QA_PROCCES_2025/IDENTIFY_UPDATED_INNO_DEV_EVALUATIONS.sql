-- =============================================================================
-- IDENTIFY: qa_innovation_development evaluations that are UPDATED and have
--           (or do not have) real QA updated fields / assessor comments.
--
-- Requirement: Delete evaluations (ALL FIELDS VALIDATED) on UPDATED INNOVATIONS
--              EXCEPT: (1) where there are NO real updated QA fields,
--                      (2) those that already have assessor comments (re-evaluated).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) List QA meta columns that count as "updated fields" (changes_updated = 1)
--    Use this to confirm which fields are considered "QA updated" for inno dev.
-- -----------------------------------------------------------------------------
SELECT
    m.id AS meta_id,
    m.col_name,
    m.display_name,
    m.changes_updated
FROM qa_indicators_meta m
JOIN qa_indicators i ON i.id = m.indicatorId
WHERE i.view_name = 'qa_innovation_development'
  AND m.changes_updated = 1
ORDER BY m.`order`, m.col_name;


-- -----------------------------------------------------------------------------
-- 2) Identify evaluations: qa_innovation_development, evaluation_status = 'Updated',
--    with flags: has_assessor_comments, has_updated_qa_fields.
--    "ALL FIELDS VALIDATED" = status = 'finalized'.
-- -----------------------------------------------------------------------------
SELECT
    e.id AS evaluation_id,
    e.indicator_view_id,
    e.status AS evaluation_status,
    e.evaluation_status AS innovation_status,
    d.result_code,
    d.title AS result_title,
    -- Has at least one assessor comment (detail not null) => was re-evaluated => KEEP
    EXISTS (
        SELECT 1
        FROM qa_comments c
        WHERE c.evaluationId = e.id
          AND c.detail IS NOT NULL
          AND TRIM(c.detail) != ''
          AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
    ) AS has_assessor_comments,
    -- Has at least one QA field (meta.changes_updated=1) that changed vs initial or previous phase
    (
        EXISTS (
            SELECT 1
            FROM qa_indicators_meta m
            JOIN qa_indicators i ON i.id = m.indicatorId AND i.view_name = 'qa_innovation_development'
            JOIN qa_innovation_development_data d2 ON d2.id = e.indicator_view_id
            LEFT JOIN qa_innovation_development_data_initial di ON di.id = d2.id
            WHERE m.changes_updated = 1
              AND (
                  -- Same id: compare current vs initial
                  (di.id IS NOT NULL AND (
                      CASE m.col_name
                          WHEN 'title' THEN (IFNULL(d2.title,'') != IFNULL(di.title,''))
                          WHEN 'description' THEN (IFNULL(d2.description,'') != IFNULL(di.description,''))
                          WHEN 'short_title' THEN (IFNULL(d2.short_title,'') != IFNULL(di.short_title,''))
                          WHEN 'evidence' THEN (IFNULL(d2.evidence,'') != IFNULL(di.evidence,''))
                          WHEN 'lead_contact_person' THEN (IFNULL(d2.lead_contact_person,'') != IFNULL(di.lead_contact_person,''))
                          WHEN 'lead_center_or_partner' THEN (IFNULL(d2.lead_center_or_partner,'') != IFNULL(di.lead_center_or_partner,''))
                          WHEN 'geographic_focus' THEN (IFNULL(d2.geographic_focus,'') != IFNULL(di.geographic_focus,''))
                          WHEN 'regions' THEN (IFNULL(d2.regions,'') != IFNULL(di.regions,''))
                          WHEN 'countries' THEN (IFNULL(d2.countries,'') != IFNULL(di.countries,''))
                          WHEN 'innovation_developers' THEN (IFNULL(d2.innovation_developers,'') != IFNULL(di.innovation_developers,''))
                          WHEN 'innovation_collaborators' THEN (IFNULL(d2.innovation_collaborators,'') != IFNULL(di.innovation_collaborators,''))
                          WHEN 'innovation_characterization' THEN (IFNULL(d2.innovation_characterization,'') != IFNULL(di.innovation_characterization,''))
                          WHEN 'innovation_readiness_level' THEN (IFNULL(d2.innovation_readiness_level,'') != IFNULL(di.innovation_readiness_level,''))
                          WHEN 'innovation_readiness_level_justification' THEN (IFNULL(d2.innovation_readiness_level_justification,'') != IFNULL(di.innovation_readiness_level_justification,''))
                          WHEN 'questions' THEN (IFNULL(d2.questions,'') != IFNULL(di.questions,''))
                          WHEN 'anticipated' THEN (IFNULL(d2.anticipated,'') != IFNULL(di.anticipated,''))
                          WHEN 'gender_tag_level' THEN (IFNULL(d2.gender_tag_level,'') != IFNULL(di.gender_tag_level,''))
                          WHEN 'climate_change_level' THEN (IFNULL(d2.climate_change_level,'') != IFNULL(di.climate_change_level,''))
                          WHEN 'nutrition_tag_level' THEN (IFNULL(d2.nutrition_tag_level,'') != IFNULL(di.nutrition_tag_level,''))
                          WHEN 'environmental_biodiversity_tag_level' THEN (IFNULL(d2.environmental_biodiversity_tag_level,'') != IFNULL(di.environmental_biodiversity_tag_level,''))
                          WHEN 'poverty_tag_level' THEN (IFNULL(d2.poverty_tag_level,'') != IFNULL(di.poverty_tag_level,''))
                          ELSE 0
                      END
                  ))
              )
        )
        OR
        -- Previous phase: same result_code, different id
        EXISTS (
            SELECT 1
            FROM qa_innovation_development_data d2
            JOIN qa_innovation_development_data_initial dp ON dp.result_code = d2.result_code AND dp.id != d2.id
            JOIN qa_indicators_meta m ON m.indicatorId = (SELECT id FROM qa_indicators WHERE view_name = 'qa_innovation_development') AND m.changes_updated = 1
            WHERE d2.id = e.indicator_view_id
              AND (
                  CASE m.col_name
                      WHEN 'title' THEN (IFNULL(d2.title,'') != IFNULL(dp.title,''))
                      WHEN 'description' THEN (IFNULL(d2.description,'') != IFNULL(dp.description,''))
                      WHEN 'short_title' THEN (IFNULL(d2.short_title,'') != IFNULL(dp.short_title,''))
                      WHEN 'evidence' THEN (IFNULL(d2.evidence,'') != IFNULL(dp.evidence,''))
                      WHEN 'lead_contact_person' THEN (IFNULL(d2.lead_contact_person,'') != IFNULL(dp.lead_contact_person,''))
                      WHEN 'lead_center_or_partner' THEN (IFNULL(d2.lead_center_or_partner,'') != IFNULL(dp.lead_center_or_partner,''))
                      WHEN 'geographic_focus' THEN (IFNULL(d2.geographic_focus,'') != IFNULL(dp.geographic_focus,''))
                      WHEN 'regions' THEN (IFNULL(d2.regions,'') != IFNULL(dp.regions,''))
                      WHEN 'countries' THEN (IFNULL(d2.countries,'') != IFNULL(dp.countries,''))
                      WHEN 'innovation_developers' THEN (IFNULL(d2.innovation_developers,'') != IFNULL(dp.innovation_developers,''))
                      WHEN 'innovation_collaborators' THEN (IFNULL(d2.innovation_collaborators,'') != IFNULL(dp.innovation_collaborators,''))
                      WHEN 'innovation_characterization' THEN (IFNULL(d2.innovation_characterization,'') != IFNULL(dp.innovation_characterization,''))
                      WHEN 'innovation_readiness_level' THEN (IFNULL(d2.innovation_readiness_level,'') != IFNULL(dp.innovation_readiness_level,''))
                      WHEN 'innovation_readiness_level_justification' THEN (IFNULL(d2.innovation_readiness_level_justification,'') != IFNULL(dp.innovation_readiness_level_justification,''))
                      WHEN 'questions' THEN (IFNULL(d2.questions,'') != IFNULL(dp.questions,''))
                      WHEN 'anticipated' THEN (IFNULL(d2.anticipated,'') != IFNULL(dp.anticipated,''))
                      WHEN 'gender_tag_level' THEN (IFNULL(d2.gender_tag_level,'') != IFNULL(dp.gender_tag_level,''))
                      WHEN 'climate_change_level' THEN (IFNULL(d2.climate_change_level,'') != IFNULL(dp.climate_change_level,''))
                      WHEN 'nutrition_tag_level' THEN (IFNULL(d2.nutrition_tag_level,'') != IFNULL(dp.nutrition_tag_level,''))
                      WHEN 'environmental_biodiversity_tag_level' THEN (IFNULL(d2.environmental_biodiversity_tag_level,'') != IFNULL(dp.environmental_biodiversity_tag_level,''))
                      WHEN 'poverty_tag_level' THEN (IFNULL(d2.poverty_tag_level,'') != IFNULL(dp.poverty_tag_level,''))
                      ELSE 0
                  END
              )
        )
    ) AS has_updated_qa_fields
FROM qa_evaluations e
JOIN qa_innovation_development_data d ON d.id = e.indicator_view_id
WHERE e.indicator_view_name = 'qa_innovation_development'
  AND e.evaluation_status = 'Updated'
  AND e.status = 'finalized'
  AND (e.evaluation_status IS NOT NULL AND e.evaluation_status != 'Deleted')
ORDER BY e.id;


-- -----------------------------------------------------------------------------
-- 3) CANDIDATES TO DELETE: Updated + finalized, WITH updated QA fields, WITHOUT assessor comments
--    (Run query 2 first and filter in app, or use the subquery below.)
-- -----------------------------------------------------------------------------
SELECT
    e.id AS evaluation_id,
    e.indicator_view_id,
    d.result_code,
    d.title AS result_title
FROM qa_evaluations e
JOIN qa_innovation_development_data d ON d.id = e.indicator_view_id
WHERE e.indicator_view_name = 'qa_innovation_development'
  AND e.evaluation_status = 'Updated'
  AND e.status = 'finalized'
  AND (e.evaluation_status IS NOT NULL AND e.evaluation_status != 'Deleted')
  -- No assessor comments => can be deleted (if has updated fields)
  AND NOT EXISTS (
      SELECT 1
      FROM qa_comments c
      WHERE c.evaluationId = e.id
        AND c.detail IS NOT NULL
        AND TRIM(c.detail) != ''
        AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
  )
  -- Has at least one QA updated field (same logic as in query 2: compare to initial or previous phase)
  AND (
      EXISTS (
          SELECT 1
          FROM qa_indicators_meta m
          JOIN qa_indicators i ON i.id = m.indicatorId AND i.view_name = 'qa_innovation_development'
          JOIN qa_innovation_development_data d2 ON d2.id = e.indicator_view_id
          LEFT JOIN qa_innovation_development_data_initial di ON di.id = d2.id
          WHERE m.changes_updated = 1
            AND di.id IS NOT NULL
            AND (
                CASE m.col_name
                    WHEN 'title' THEN (IFNULL(d2.title,'') != IFNULL(di.title,''))
                    WHEN 'description' THEN (IFNULL(d2.description,'') != IFNULL(di.description,''))
                    WHEN 'short_title' THEN (IFNULL(d2.short_title,'') != IFNULL(di.short_title,''))
                    WHEN 'evidence' THEN (IFNULL(d2.evidence,'') != IFNULL(di.evidence,''))
                    WHEN 'lead_contact_person' THEN (IFNULL(d2.lead_contact_person,'') != IFNULL(di.lead_contact_person,''))
                    WHEN 'lead_center_or_partner' THEN (IFNULL(d2.lead_center_or_partner,'') != IFNULL(di.lead_center_or_partner,''))
                    WHEN 'geographic_focus' THEN (IFNULL(d2.geographic_focus,'') != IFNULL(di.geographic_focus,''))
                    WHEN 'regions' THEN (IFNULL(d2.regions,'') != IFNULL(di.regions,''))
                    WHEN 'countries' THEN (IFNULL(d2.countries,'') != IFNULL(di.countries,''))
                    WHEN 'innovation_developers' THEN (IFNULL(d2.innovation_developers,'') != IFNULL(di.innovation_developers,''))
                    WHEN 'innovation_collaborators' THEN (IFNULL(d2.innovation_collaborators,'') != IFNULL(di.innovation_collaborators,''))
                    WHEN 'innovation_characterization' THEN (IFNULL(d2.innovation_characterization,'') != IFNULL(di.innovation_characterization,''))
                    WHEN 'innovation_readiness_level' THEN (IFNULL(d2.innovation_readiness_level,'') != IFNULL(di.innovation_readiness_level,''))
                    WHEN 'innovation_readiness_level_justification' THEN (IFNULL(d2.innovation_readiness_level_justification,'') != IFNULL(di.innovation_readiness_level_justification,''))
                    WHEN 'questions' THEN (IFNULL(d2.questions,'') != IFNULL(di.questions,''))
                    WHEN 'anticipated' THEN (IFNULL(d2.anticipated,'') != IFNULL(di.anticipated,''))
                    WHEN 'gender_tag_level' THEN (IFNULL(d2.gender_tag_level,'') != IFNULL(di.gender_tag_level,''))
                    WHEN 'climate_change_level' THEN (IFNULL(d2.climate_change_level,'') != IFNULL(di.climate_change_level,''))
                    WHEN 'nutrition_tag_level' THEN (IFNULL(d2.nutrition_tag_level,'') != IFNULL(di.nutrition_tag_level,''))
                    WHEN 'environmental_biodiversity_tag_level' THEN (IFNULL(d2.environmental_biodiversity_tag_level,'') != IFNULL(di.environmental_biodiversity_tag_level,''))
                    WHEN 'poverty_tag_level' THEN (IFNULL(d2.poverty_tag_level,'') != IFNULL(di.poverty_tag_level,''))
                    ELSE 0
                END
            )
      )
      OR
      EXISTS (
          SELECT 1
          FROM qa_innovation_development_data d2
          JOIN qa_innovation_development_data_initial dp ON dp.result_code = d2.result_code AND dp.id != d2.id
          JOIN qa_indicators_meta m ON m.indicatorId = (SELECT id FROM qa_indicators WHERE view_name = 'qa_innovation_development') AND m.changes_updated = 1
          WHERE d2.id = e.indicator_view_id
            AND (
                CASE m.col_name
                    WHEN 'title' THEN (IFNULL(d2.title,'') != IFNULL(dp.title,''))
                    WHEN 'description' THEN (IFNULL(d2.description,'') != IFNULL(dp.description,''))
                    WHEN 'short_title' THEN (IFNULL(d2.short_title,'') != IFNULL(dp.short_title,''))
                    WHEN 'evidence' THEN (IFNULL(d2.evidence,'') != IFNULL(dp.evidence,''))
                    WHEN 'lead_contact_person' THEN (IFNULL(d2.lead_contact_person,'') != IFNULL(dp.lead_contact_person,''))
                    WHEN 'lead_center_or_partner' THEN (IFNULL(d2.lead_center_or_partner,'') != IFNULL(dp.lead_center_or_partner,''))
                    WHEN 'geographic_focus' THEN (IFNULL(d2.geographic_focus,'') != IFNULL(dp.geographic_focus,''))
                    WHEN 'regions' THEN (IFNULL(d2.regions,'') != IFNULL(dp.regions,''))
                    WHEN 'countries' THEN (IFNULL(d2.countries,'') != IFNULL(dp.countries,''))
                    WHEN 'innovation_developers' THEN (IFNULL(d2.innovation_developers,'') != IFNULL(dp.innovation_developers,''))
                    WHEN 'innovation_collaborators' THEN (IFNULL(d2.innovation_collaborators,'') != IFNULL(dp.innovation_collaborators,''))
                    WHEN 'innovation_characterization' THEN (IFNULL(d2.innovation_characterization,'') != IFNULL(dp.innovation_characterization,''))
                    WHEN 'innovation_readiness_level' THEN (IFNULL(d2.innovation_readiness_level,'') != IFNULL(dp.innovation_readiness_level,''))
                    WHEN 'innovation_readiness_level_justification' THEN (IFNULL(d2.innovation_readiness_level_justification,'') != IFNULL(dp.innovation_readiness_level_justification,''))
                    WHEN 'questions' THEN (IFNULL(d2.questions,'') != IFNULL(dp.questions,''))
                    WHEN 'anticipated' THEN (IFNULL(d2.anticipated,'') != IFNULL(dp.anticipated,''))
                    WHEN 'gender_tag_level' THEN (IFNULL(d2.gender_tag_level,'') != IFNULL(dp.gender_tag_level,''))
                    WHEN 'climate_change_level' THEN (IFNULL(d2.climate_change_level,'') != IFNULL(dp.climate_change_level,''))
                    WHEN 'nutrition_tag_level' THEN (IFNULL(d2.nutrition_tag_level,'') != IFNULL(dp.nutrition_tag_level,''))
                    WHEN 'environmental_biodiversity_tag_level' THEN (IFNULL(d2.environmental_biodiversity_tag_level,'') != IFNULL(dp.environmental_biodiversity_tag_level,''))
                    WHEN 'poverty_tag_level' THEN (IFNULL(d2.poverty_tag_level,'') != IFNULL(dp.poverty_tag_level,''))
                    ELSE 0
                END
            )
      )
  )
ORDER BY e.id;


-- -----------------------------------------------------------------------------
-- 4) TO KEEP (do NOT delete): Updated + finalized but (no real updated QA fields OR has assessor comments)
--    Use query 2 and filter: has_assessor_comments = 1 OR has_updated_qa_fields = 0
-- -----------------------------------------------------------------------------
-- Same as query 2; then in your process exclude from delete where
-- has_assessor_comments = 1 OR has_updated_qa_fields = 0.


-- -----------------------------------------------------------------------------
-- NOTE: If qa_indicators_meta has more col_name with changes_updated=1 than
--       the CASE list above, run query 1 and add any missing col_name to the
--       CASE expressions (same pattern: WHEN 'col_name' THEN (IFNULL(d2.col_name,'') != IFNULL(di.col_name,''))).
--       Also ensure qa_innovation_development_data / _initial have that column.
-- =============================================================================
