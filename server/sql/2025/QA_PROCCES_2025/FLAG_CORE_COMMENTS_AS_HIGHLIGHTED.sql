-- =============================================================================
-- Flag all comments on core fields as highlighted (batchDate = '2026-02-19 12:00:00')
-- Comments linked to qa_indicators_meta with is_core = 1 are updated to highlight_comment = 1.
-- Optional: set require_changes = 1 for "change required" (uncomment the line in SET).
-- "Change implemented" is usually set per comment when the CRP implements the change.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) LIST: run this first to validate which comments will be updated
-- -----------------------------------------------------------------------------
SELECT
  c.id AS comment_id,
  c.evaluationId,
  c.metaId,
  c.highlight_comment AS current_highlight_comment,
  c.require_changes AS current_require_changes,
  c.is_deleted,
  c.detail,
  qim.display_name AS meta_display_name,
  qim.is_core,
  e.indicator_view_name,
  e.indicator_view_id,
  e.batchDate,
  e.phase_year
FROM qa_comments c
INNER JOIN qa_evaluations e ON e.id = c.evaluationId
INNER JOIN qa_indicators_meta qim ON qim.id = c.metaId AND qim.is_core = 1
WHERE
  e.batchDate = '2026-02-19 12:00:00'
  AND e.createdAt = '2026-03-04 15:00:18'
  AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
  AND e.indicator_view_name = 'qa_knowledge_product'
  AND c.detail IS NOT NULL
ORDER BY e.indicator_view_name, e.indicator_view_id, c.metaId, c.id;

-- Count (optional)
-- SELECT COUNT(*) AS total_core_comments_to_flag
-- FROM qa_comments c
-- INNER JOIN qa_evaluations e ON e.id = c.evaluationId
-- INNER JOIN qa_indicators_meta qim ON qim.id = c.metaId AND qim.is_core = 1
-- WHERE e.batchDate = '2026-02-19 12:00:00' AND e.createdAt = '2026-03-04 15:00:18'
--   AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
--   AND e.indicator_view_name = 'qa_knowledge_product' AND c.detail IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2) UPDATE: run after validating the list above
-- -----------------------------------------------------------------------------
SET SQL_SAFE_UPDATES = 0;

UPDATE qa_comments c
INNER JOIN qa_evaluations e ON e.id = c.evaluationId
INNER JOIN qa_indicators_meta qim ON qim.id = c.metaId AND qim.is_core = 1
SET
  c.highlight_comment = 1,
  c.require_changes = 1,
  c.updatedAt = CURRENT_TIMESTAMP()
  c.highlightById = 583
WHERE
  e.batchDate = '2026-02-19 12:00:00'
  AND e.createdAt = '2026-03-04 15:00:18'
  AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
  AND e.indicator_view_name = 'qa_knowledge_product'
  AND c.detail IS NOT NULL;

-- Optional: set highlightById to a specific user (e.g. system or batch user).
-- Uncomment and set @highlight_by_user_id if needed:
-- SET @highlight_by_user_id = 1;
-- UPDATE qa_comments c
-- INNER JOIN qa_evaluations e ON e.id = c.evaluationId
-- INNER JOIN qa_indicators_meta qim ON qim.id = c.metaId AND qim.is_core = 1
-- SET c.highlightById = @highlight_by_user_id
-- WHERE e.batchDate = '2026-02-19 12:00:00';

SET SQL_SAFE_UPDATES = 1;
