
-- MediAgend | Módulo 3
-- Geração de agendas fictícias para testes acadêmicos.
-- Período: novembro de 2026 a fevereiro de 2027.
--
-- Médicos:
-- 1 - Dra. Ana Silva
-- 2 - Dr. Carlos Souza
-- 3 - Dra. Mariana Lima
--
-- O script preserva disponibilidades vinculadas a consultas,
-- inclusive consultas canceladas, para manter seu histórico.

BEGIN;

-- Remove horários do período de demonstração que não
-- estejam vinculados a nenhuma consulta.
DELETE FROM disponibilidades d
WHERE d.medico_id IN (1, 2, 3)
  AND (d.inicio AT TIME ZONE 'America/Sao_Paulo')::date
      BETWEEN DATE '2026-11-06' AND DATE '2027-02-28'
  AND NOT EXISTS (
    SELECT 1
    FROM consultas c
    WHERE c.disponibilidade_id = d.id
  );

-- Distribui os horários conforme a agenda fictícia
-- de cada médico, com dias e turnos distintos.
WITH dias AS (
  SELECT dia::date AS data
  FROM generate_series(
    DATE '2026-11-06',
    DATE '2027-02-28',
    INTERVAL '1 day'
  ) AS dia
),
agenda AS (
  SELECT
    m.id AS medico_id,
    dias.data,
    h.hora
  FROM dias
  CROSS JOIN (VALUES (1), (2), (3)) AS m(id)
  CROSS JOIN (
    VALUES
      (TIME '08:00'),
      (TIME '09:00'),
      (TIME '10:00'),
      (TIME '11:00'),
      (TIME '13:00'),
      (TIME '14:00'),
      (TIME '15:00'),
      (TIME '16:00')
  ) AS h(hora)
  WHERE
    (
      m.id = 1
      AND (
        EXTRACT(ISODOW FROM dias.data) IN (1, 3)
        OR (
          EXTRACT(ISODOW FROM dias.data) = 5
          AND EXTRACT(DAY FROM dias.data)::int % 2 = 0
        )
      )
      AND h.hora IN (
        TIME '08:00', TIME '09:00',
        TIME '14:00', TIME '15:00'
      )
    )
    OR
    (
      m.id = 2
      AND (
        EXTRACT(ISODOW FROM dias.data) IN (2, 4)
        OR (
          EXTRACT(ISODOW FROM dias.data) = 1
          AND EXTRACT(WEEK FROM dias.data)::int % 2 = 0
        )
      )
      AND h.hora IN (
        TIME '09:00', TIME '10:00',
        TIME '14:00'
      )
    )
    OR
    (
      m.id = 3
      AND (
        EXTRACT(ISODOW FROM dias.data) IN (1, 5)
        OR (
          EXTRACT(ISODOW FROM dias.data) = 3
          AND EXTRACT(DAY FROM dias.data)::int % 3 <> 0
        )
      )
      AND h.hora IN (
        TIME '08:00', TIME '11:00',
        TIME '13:00', TIME '16:00'
      )
    )
)
INSERT INTO disponibilidades (
  medico_id,
  inicio,
  fim
)
SELECT
  medico_id,
  (data + hora) AT TIME ZONE 'America/Sao_Paulo',
  (data + hora + INTERVAL '30 minutes')
    AT TIME ZONE 'America/Sao_Paulo'
FROM agenda
WHERE (
  EXTRACT(DAY FROM data)::int
  + EXTRACT(HOUR FROM hora)::int
  + medico_id
) % 5 <> 0
ON CONFLICT (medico_id, inicio) DO NOTHING;

COMMIT;
