# QA Badge – Especificación de identificación de casos (PDF Reporting)

## Fuentes de datos

- **prdb:** `result` (r), `results_innovations_dev`, `results_innovations_use`, `clarisa_innovation_readiness_level`, `clarisa_innovation_use_levels`
- **qadb:** `qa_evaluations` (e), `qa_comments` (c), `qa_evaluations_assessed_by_second_round_qa_users` (s)

**Relación result ↔ evaluación:**  
`result.id` = `qa_evaluations.indicator_view_id` y `qa_evaluations.indicator_view_name` según tipo (ej. `qa_policy_change`, `qa_innovation_development`, etc.), **o** se puede resolver el `indicator_view_name` por `result.result_type_id` y buscar la evaluación por `(indicator_view_id = r.id, phase_year, indicator_view_name)`.

**result_type_id (prdb.result):**

| id | name                          |
|----|-------------------------------|
| 1  | Policy change                 |
| 2  | Innovation use                |
| 4  | Other outcome                 |
| 5  | Capacity sharing for development |
| 6  | Knowledge product             |
| 7  | Innovation development        |
| 8  | Other output                  |
| 9  | Impact contribution           |

---

## Reglas de identificación por caso

### Caso 1 — QA in progress  
**Condición:** `r.in_qa = 1`  
**Badge:** `in-progress`  
**Nota:** Sin mirar qadb. Si está en QA, mostramos este y no evaluamos el resto.

---

### Caso 2 — KP Center Manager  
**Condición:**  
- `r.result_type_id = 6` (Knowledge product)  
- **No** existe fila en `qadb.qa_evaluations` para este result (mismo phase_year, `indicator_view_id = r.id`, `indicator_view_name` = el que corresponda a KP, ej. `qa_knowledge_product`).

**Badge:** `kp`

---

### Caso 3 — KP MQAP  
**Condición:**  
- `r.result_type_id = 6`  
- **Sí** existe fila en `qa_evaluations` para este result  
- `qa_evaluations.status = 'autochecked'`

**Badge:** `mqap`

---

### Caso 4 — Dos asesores (sin senior)  
**Condición:**  
- Result **sí** tiene evaluación en `qa_evaluations`  
- **No** hay revisión senior: ningún `qa_comments` con `tpb = 1` y `is_deleted = 0` para esa evaluación  
- Pasó solo primera ronda: **no** existe fila en `qa_evaluations_assessed_by_second_round_qa_users` con `qaEvaluationsId = qa_evaluations.id`  
- Y `r.status_id = 2` (QAed)  
- Aplica a: Policy (1), Other Output (8), Other Outcome (4), Capacity sharing (5).  
  No aplica a KP (6) ni a Innovation Dev (7) / Innovation Use (2) para este caso “simple”.

**Badge:** `two-assessors`

---

### Caso 5 — Revisión senior (no innovación)  
**Condición:**  
- Result tiene evaluación  
- **Sí** hay al menos un `qa_comments` con `tpb = 1` y `is_deleted = 0` para esa evaluación (revisión senior)  
- **Sí** hay fila en `qa_evaluations_assessed_by_second_round_qa_users` para esa evaluación (pasó segunda ronda)  
- Tipo de result **no** es Innovation Dev (7) ni Innovation Use (2): es Policy (1), Other Output (8), Other Outcome (4), Cap Sharing (5).

**Badge:** `senior`  
**adjustments:** Sin histórico de “from” en BD; si en el futuro hay fuente para ajustes (ej. otros campos), se pueden añadir. Por ahora se puede devolver vacío o no incluir.

---

### Caso 4B — Innovation Development + senior  
**Condición:**  
- `r.result_type_id = 7`  
- Evaluación existe, hay senior (`tpb = 1` en algún comment) y segunda ronda (tabla `qa_evaluations_assessed_by_second_round_qa_users`).

**Nivel actual (validado):**  
```sql
SELECT cirl.`level`
FROM result r
JOIN results_innovations_dev rid ON rid.results_id = r.id
JOIN clarisa_innovation_readiness_level cirl ON cirl.id = rid.innovation_readiness_level_id
WHERE r.id = ?
```  
**Badge:** `senior-innovation`; si `level >= 6` → gold (front).  
**adjustments:** No hay “nivel antes de QA” en BD; solo se puede mostrar valor actual como confirmado, ej. `[{ "label": "Innovation Readiness", "to_value": "Level X" }]`. No hay `from_value`.

---

### Caso 4C — Innovation Use + senior  
**Condición:**  
- `r.result_type_id = 2`  
- Evaluación existe, senior (tpb = 1) y segunda ronda.

**Nivel actual:**  
```sql
SELECT ciul.`level`
FROM result r
JOIN results_innovations_use riu ON riu.results_id = r.id
JOIN clarisa_innovation_use_levels ciul ON ciul.id = riu.innovation_use_level_id
WHERE r.id = ?
```  
**Badge:** `senior-innovation`; si `level >= 6` → gold.  
**adjustments:** Solo valor actual, ej. `[{ "label": "Innovation Use Level", "to_value": "Level X" }]`.

---

### Caso 4D — Innovación confirmada (sin cambio)  
**Condición:**  
- Mismo criterio que 4B/4C (Innovation Dev o Use + senior + segunda ronda).  
- Se considera “confirmado” porque no hay histórico: no podemos distinguir “ajustado” vs “confirmado” en BD.  
- **Badge:** estándar (`senior`) si `level < 6`; gold si `level >= 6`.  
- **adjustments_title:** “The submitted innovation readiness/use level was quality assured and confirmed:”  
- **adjustments:** Solo `to_value` (nivel actual).

En la práctica, 4B/4C/4D se implementan como:  
- Si Innovation Dev (7) + senior → 4B (readiness level, gold si ≥ 6).  
- Si Innovation Use (2) + senior → 4C (use level, gold si ≥ 6).  
- “4D” puede ser el mismo payload que 4B/4C pero con copy “confirmed” y sin `from_value`; o un solo flujo “innovation + senior” que devuelve nivel y el front muestra “confirmado” cuando no hay from_value.

---

## Orden de evaluación (para un result dado)

1. **Caso 1:** Si `r.in_qa = 1` → devolver `qa_info` in-progress y **terminar**.
2. **Solo si result_type_id = 6 (KP):**
   - Si no existe en `qa_evaluations` → **Caso 2** (kp).
   - Si existe y `status = 'autochecked'` → **Caso 3** (mqap).
   - Si existe y no autochecked → tratar como evaluación normal (casos 4/5 según rondas y senior).
3. **Resto (tiene evaluación):**
   - Si hay comment con `tpb = 1` (senior) y segunda ronda:
     - Si `result_type_id = 7` → **4B** (readiness level, gold si ≥ 6).
     - Si `result_type_id = 2` → **4C** (use level, gold si ≥ 6).
     - Si tipo 1, 4, 5, 8 → **Caso 5** (senior, badge `senior`).
   - Si no senior y pasó solo primera ronda (no en `qa_evaluations_assessed_by_second_round_qa_users`, r.status_id = 2) → **Caso 4** (two-assessors).
4. Si no encaja en ninguno (ej. tiene evaluación pero sin segunda ronda y sin status_id=2): definir fallback (ej. no mostrar badge o “QA in progress”).

---

## Resumen de tablas/columnas clave

| Qué | Dónde |
|-----|--------|
| KP no en QA Platform | No fila en qadb.qa_evaluations para (indicator_view_id=r.id, indicator_view_name según tipo, phase_year) |
| MQAP | qa_evaluations.status = 'autochecked' |
| Segunda ronda | Existe fila en qa_evaluations_assessed_by_second_round_qa_users (qaEvaluationsId = qa_evaluations.id) |
| Senior | Existe qa_comments con evaluationId = qa_evaluations.id AND tpb = 1 AND is_deleted = 0 |
| Readiness level (0–9) | result → results_innovations_dev → clarisa_innovation_readiness_level.level |
| Use level (0–9) | result → results_innovations_use → clarisa_innovation_use_levels.level |
| Gold badge | level >= 6 (para 4B/4C/4D) |

---

## Nota sobre ajustes “Level X → Level Y”

No hay histórico de “nivel antes de QA” en BD. Por tanto:

- **adjustments** se devuelven siempre con solo **to_value** (nivel actual validado).
- **from_value** no se puede rellenar; el front puede mostrar solo “Level X” (confirmado) o dejar el texto “Level X → Level Y” para cuando en el futuro exista fuente de datos.

Cuando haya una fuente fiable para “valor antes de QA”, se puede extender el payload con `from_value` sin cambiar la lógica de identificación de casos.
