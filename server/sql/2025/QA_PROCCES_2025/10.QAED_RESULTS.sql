START TRANSACTION;

-- 1. Registrar la trazabilidad en el log
-- Capturamos los IDs de los 180 (o los que estén activos en in_qa actualmente)
INSERT INTO prdb.result_qaed_log (result_id, qaed_date, qaed_comments, qaed_user)
SELECT id, NOW(), 'QA AVISA 2025 Mini Batch', 307
FROM `result`
WHERE status_id = 3 
  AND in_qa = 1
  AND is_active = 1
  AND version_id IN (6, 7);

-- 2. Pasar de 'Submitted' (3) a 'QAed' (2) y quitar bandera in_qa
UPDATE `result`
SET 
    status_id = 2,
    in_qa = 0,
    last_updated_date = NOW(),
    last_updated_by = 307
WHERE status_id = 3 
  AND in_qa = 1
  AND is_active = 1
  AND version_id IN (6, 7);

-- 3. Limpiar bandera in_qa para registros en edición (Borradores)
UPDATE `result`
SET 
    in_qa = 0,
    last_updated_date = NOW(),
    last_updated_by = 307
WHERE status_id = 1
  AND in_qa = 1
  AND version_id IN (6, 7);

-- 4. Quitar bandera in_qa a todos los registros inactivos
UPDATE `result`
SET 
    in_qa = 0,
    last_updated_date = NOW(),
    last_updated_by = 307
WHERE is_active = 0
  AND in_qa = 1;

-- VERIFICACIÓN:
SELECT COUNT(*) FROM prdb.result_qaed_log WHERE qaed_comments = 'QA AVISA 2025 Mini Batch';

-- Si los conteos coinciden con los 180 esperados:
COMMIT;

-- De lo contrario:
-- ROLLBACK;