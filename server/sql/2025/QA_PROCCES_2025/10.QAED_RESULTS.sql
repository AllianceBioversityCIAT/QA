-- Iniciamos la transacción para asegurar que todo ocurra en conjunto
START TRANSACTION;

-- 1. Registrar la trazabilidad en el log (DEBE ser el primer paso)
-- Usamos los criterios originales para capturar los IDs antes del cambio
INSERT INTO prdb.result_qaed_log (result_id, qaed_date, qaed_comments, qaed_user)
SELECT id, NOW(), 'QA 2025 Process for SP/A', 307
FROM `result`
WHERE status_id = 3 
  AND in_qa = 1;

-- 2. Actualizar el registro principal: status, bandera de QA y fecha
UPDATE `result`
SET 
    status_id = 2,
    in_qa = 0,                -- Sacamos el registro de QA
    last_updated_date = NOW()  -- Sincronizamos la fecha de cambio
WHERE status_id = 3 
  AND in_qa = 1;

-- 3. Marcar los editing como in_qa = 0
UPDATE `result`
SET 
    in_qa = 0,
    last_updated_date = NOW()
WHERE status_id = 1
  AND in_qa = 1
  AND version_id IN (6, 7);

-- 4. Confirmar los cambios si las filas afectadas coinciden
COMMIT;

-- Si algo falla o quieres cancelar antes del commit:
-- ROLLBACK;