-- =============================================================================
-- Function: get_qa_info(p_result_id)
-- Returns the qa_info JSON for PDF Reporting according to PR_QA_BADGE_SPEC.md.
-- Create in prdb; requires SELECT on qadb.qa_evaluations, qadb.qa_comments,
-- qadb.qa_evaluations_assessed_by_second_round_qa_users.
-- =============================================================================

DELIMITER //

DROP FUNCTION IF EXISTS prdb.get_qa_info//

CREATE FUNCTION prdb.get_qa_info(p_result_id BIGINT)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_result_type_id INT;
  DECLARE v_in_qa TINYINT;
  DECLARE v_status_id BIGINT;
  DECLARE v_phase_year INT;
  DECLARE v_indicator_view_name VARCHAR(64);
  DECLARE v_eval_id INT DEFAULT NULL;
  DECLARE v_eval_status VARCHAR(32) DEFAULT NULL;
  DECLARE v_has_second_round TINYINT DEFAULT 0;
  DECLARE v_has_senior TINYINT DEFAULT 0;
  DECLARE v_level INT DEFAULT NULL;
  DECLARE v_qa_url VARCHAR(512) DEFAULT 'https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does';

  -- Get result info from prdb
  SELECT r.result_type_id, IFNULL(r.in_qa, 0), r.status_id, v.phase_year
  INTO v_result_type_id, v_in_qa, v_status_id, v_phase_year
  FROM prdb.result r
  JOIN prdb.version v ON v.id = r.version_id
  WHERE r.id = p_result_id
  LIMIT 1;

  IF v_result_type_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Map result_type_id to qadb indicator_view_name
  SET v_indicator_view_name = CASE v_result_type_id
    WHEN 1 THEN 'qa_policy_change'
    WHEN 2 THEN 'qa_innovation_use'
    WHEN 4 THEN 'qa_other_outcome'
    WHEN 5 THEN 'qa_capdev'
    WHEN 6 THEN 'qa_knowledge_product'
    WHEN 7 THEN 'qa_innovation_development'
    WHEN 8 THEN 'qa_other_output'
    WHEN 9 THEN 'qa_impact_contribution'
    WHEN 10 THEN 'qa_innovation_use_ipsr'
    ELSE NULL
  END;

  -- Case 1: QA in progress
  IF v_in_qa = 1 THEN
    RETURN JSON_OBJECT(
      'badge', 'in-progress',
      'title', 'Result quality assurance in progress',
      'description', 'This result is currently under review by QA expert assessors following the CGIAR standard QA process. Updates will be reflected once the review is complete.'
    );
  END IF;

  -- Get evaluation if exists (qadb)
  SELECT e.id, e.status INTO v_eval_id, v_eval_status
  FROM qadb.qa_evaluations e
  WHERE e.indicator_view_id = p_result_id
    AND e.phase_year = IFNULL(v_phase_year, 2025)
    AND e.indicator_view_name = v_indicator_view_name
  LIMIT 1;

  -- Case 2: KP and no evaluation (Center Manager)
  IF v_result_type_id = 6 AND v_eval_id IS NULL THEN
    RETURN JSON_OBJECT(
      'badge', 'kp',
      'title', 'Result quality assured by CGIAR Center knowledge manager',
      'description', 'Quality Assurance is provided by CGIAR Center librarians for knowledge products not processed through the QA Platform.'
    );
  END IF;

  -- Case 3: KP and autochecked (MQAP)
  IF v_result_type_id = 6 AND v_eval_id IS NOT NULL AND LOWER(IFNULL(v_eval_status, '')) = 'autochecked' THEN
    RETURN JSON_OBJECT(
      'badge', 'mqap',
      'title', 'Result automated quality assured using MQAP',
      'description', 'This knowledge product was automatically quality assured using the Monitoring, Quality Assurance and Performance (MQAP) system, which checks peer-reviewed publications against established criteria.'
    );
  END IF;

  -- No evaluation for non-KP: no badge
  IF v_eval_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check second round and senior (qadb)
  SELECT EXISTS(
    SELECT 1 FROM qadb.qa_evaluations_assessed_by_second_round_qa_users s
    WHERE s.qaEvaluationsId = v_eval_id
  ) INTO v_has_second_round;

  SELECT EXISTS(
    SELECT 1 FROM qadb.qa_comments c
    WHERE c.evaluationId = v_eval_id AND c.tpb = 1 AND c.is_deleted = 0
  ) INTO v_has_senior;

  -- Case 4: Two assessors (no senior, no second round) — any status once in QA
  IF v_has_senior = 0 AND v_has_second_round = 0 AND v_result_type_id IN (1, 4, 5, 8, 9) THEN
    RETURN JSON_OBJECT(
      'badge', 'two-assessors',
      'title', 'Result quality assured by two independent assessors',
      'description', 'This result underwent quality assurance by two independent assessors following the CGIAR standard',
      'qa_url', v_qa_url
    );
  END IF;

  -- Case 4 (innovation): first round only, no senior — types 2, 7, 10. US: 4B/4C gold if level >= 6 (same title as Case 3). Always show readiness/use level.
  IF v_has_senior = 0 AND v_has_second_round = 0 AND v_result_type_id IN (2, 7, 10) THEN
    IF v_result_type_id = 7 THEN
      SELECT cirl.level INTO v_level
      FROM prdb.results_innovations_dev rid
      JOIN prdb.clarisa_innovation_readiness_level cirl ON cirl.id = rid.innovation_readiness_level_id
      WHERE rid.results_id = p_result_id
      ORDER BY rid.result_innovation_dev_id DESC
      LIMIT 1;
      RETURN JSON_OBJECT(
        'badge', IF(v_level >= 6, 'senior-innovation-gold', 'two-assessors'),
        'title', 'Result quality assured by two independent assessors',
        'description', 'This result underwent quality assurance by two independent assessors following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Core data points that were adjusted during the QA process:',
        'adjustments', JSON_ARRAY(JSON_OBJECT('label', 'Innovation Readiness', 'to_value', CONCAT('Level ', IFNULL(v_level, 'N/A')))),
        'level', v_level
      );
    ELSEIF v_result_type_id = 2 THEN
      SELECT ciul.level INTO v_level
      FROM prdb.results_innovations_use riu
      JOIN prdb.clarisa_innovation_use_levels ciul ON ciul.id = riu.innovation_use_level_id
      WHERE riu.results_id = p_result_id
      LIMIT 1;
      RETURN JSON_OBJECT(
        'badge', IF(v_level >= 6, 'senior-innovation-gold', 'two-assessors'),
        'title', 'Result quality assured by two independent assessors',
        'description', 'This result underwent quality assurance by two independent assessors following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Innovation Use:',
        'adjustments', JSON_ARRAY(JSON_OBJECT('label', 'Innovation Use Level', 'to_value', CONCAT('Level ', IFNULL(v_level, 'N/A')))),
        'level', v_level
      );
    END IF;
    RETURN JSON_OBJECT(
      'badge', 'two-assessors',
      'title', 'Result quality assured by two independent assessors',
      'description', 'This result underwent quality assurance by two independent assessors following the CGIAR standard',
      'qa_url', v_qa_url
    );
  END IF;

  -- Second round but no senior. US: 4B/4C — gold if level >= 6; if level < 6 standard badge (Cases 3 and 4). Same title as Case 4 (two rounds).
  IF v_has_senior = 0 AND v_has_second_round = 1 THEN
    IF v_result_type_id = 7 THEN
      SELECT cirl.level INTO v_level
      FROM prdb.results_innovations_dev rid
      JOIN prdb.clarisa_innovation_readiness_level cirl ON cirl.id = rid.innovation_readiness_level_id
      WHERE rid.results_id = p_result_id
      ORDER BY rid.result_innovation_dev_id DESC
      LIMIT 1;
      RETURN JSON_OBJECT(
        'badge', IF(v_level >= 6, 'senior-innovation-gold', 'two-assessors'),
        'title', 'Result quality assured by two assessors and subsequently reviewed by a senior third party',
        'description', 'This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Core data points that were adjusted during the QA process:',
        'adjustments', JSON_ARRAY(JSON_OBJECT('label', 'Innovation Readiness', 'to_value', CONCAT('Level ', IFNULL(v_level, 'N/A')))),
        'level', v_level
      );
    ELSEIF v_result_type_id = 2 THEN
      SELECT ciul.level INTO v_level
      FROM prdb.results_innovations_use riu
      JOIN prdb.clarisa_innovation_use_levels ciul ON ciul.id = riu.innovation_use_level_id
      WHERE riu.results_id = p_result_id
      LIMIT 1;
      RETURN JSON_OBJECT(
        'badge', IF(v_level >= 6, 'senior-innovation-gold', 'two-assessors'),
        'title', 'Result quality assured by two assessors and subsequently reviewed by a senior third party',
        'description', 'This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Innovation Use:',
        'adjustments', JSON_ARRAY(JSON_OBJECT('label', 'Innovation Use Level', 'to_value', CONCAT('Level ', IFNULL(v_level, 'N/A')))),
        'level', v_level
      );
    END IF;
    RETURN JSON_OBJECT(
      'badge', 'two-assessors',
      'title', 'Result quality assured by two independent assessors',
      'description', 'This result underwent quality assurance by two independent assessors following the CGIAR standard',
      'qa_url', v_qa_url
    );
  END IF;

  -- Cases 5 / 4B / 4C: senior + second round (required first; level/gold only evaluated inside this block)
  IF v_has_senior = 1 AND v_has_second_round = 1 THEN
    -- Case 5: Senior, non-innovation (Policy, Other Output, Other Outcome, Cap Sharing, Impact)
    IF v_result_type_id IN (1, 4, 5, 8, 9) THEN
      RETURN JSON_OBJECT(
        'badge', 'senior',
        'title', 'Result quality assured by two assessors and subsequently reviewed by a senior third party',
        'description', 'This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Core data points that were adjusted during the QA process:',
        'adjustments', JSON_ARRAY()
      );
    END IF;

    -- Case 4B: Innovation Development (readiness level). Gold only if v_level >= 6; if v_level < 6 standard badge (two-assessors).
    IF v_result_type_id = 7 THEN
      SELECT cirl.level INTO v_level
      FROM prdb.results_innovations_dev rid
      JOIN prdb.clarisa_innovation_readiness_level cirl ON cirl.id = rid.innovation_readiness_level_id
      WHERE rid.results_id = p_result_id
      ORDER BY rid.result_innovation_dev_id DESC
      LIMIT 1;

      RETURN JSON_OBJECT(
        'badge', IF(v_level >= 6, 'senior-innovation-gold', 'two-assessors'),
        'title', 'Result quality assured by two assessors and subsequently reviewed by a senior third party',
        'description', 'This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Core data points that were adjusted during the QA process:',
        'adjustments', JSON_ARRAY(JSON_OBJECT('label', 'Innovation Readiness', 'to_value', CONCAT('Level ', IFNULL(v_level, 'N/A')))),
        'level', v_level
      );
    END IF;

    -- Case 4C: Innovation Use (use level)
    IF v_result_type_id = 2 THEN
      SELECT ciul.level INTO v_level
      FROM prdb.results_innovations_use riu
      JOIN prdb.clarisa_innovation_use_levels ciul ON ciul.id = riu.innovation_use_level_id
      WHERE riu.results_id = p_result_id
      LIMIT 1;

      RETURN JSON_OBJECT(
        'badge', IF(v_level >= 6, 'senior-innovation-gold', 'two-assessors'),
        'title', 'Result quality assured by two assessors and subsequently reviewed by a senior third party',
        'description', 'This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Innovation Use:',
        'adjustments', JSON_ARRAY(JSON_OBJECT('label', 'Innovation Use Level', 'to_value', CONCAT('Level ', IFNULL(v_level, 'N/A')))),
        'level', v_level
      );
    END IF;

    -- Innovation Package (10): treat like senior non-innovation for now (no level in this function)
    IF v_result_type_id = 10 THEN
      RETURN JSON_OBJECT(
        'badge', 'senior',
        'title', 'Result quality assured by two assessors and subsequently reviewed by a senior third party',
        'description', 'This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard',
        'qa_url', v_qa_url,
        'adjustments_title', 'Core data points that were adjusted during the QA process:',
        'adjustments', JSON_ARRAY()
      );
    END IF;
  END IF;

  -- Fallback: has evaluation but no case matched (e.g. status/round quirks) → two-assessors
  RETURN JSON_OBJECT(
    'badge', 'two-assessors',
    'title', 'Result quality assured by two independent assessors',
    'description', 'This result underwent quality assurance by two independent assessors following the CGIAR standard',
    'qa_url', v_qa_url
  );
END//

DELIMITER ;

-- =============================================================================
-- Usage in view result_phase_2025 (prdb)
-- Replace the previous qa_info expression (Case 1 only) with:
-- =============================================================================
--
--   prdb.get_qa_info(r.id) AS qa_info
--
-- So the view returns the full qa_info for all cases (1, 2, 3, 4, 5, 4B, 4C, 4D).
--
-- In reportBasicInfoByResultCode (phase_year = 2025), keep:
--   "qa_info", q1.qa_info
-- =============================================================================
