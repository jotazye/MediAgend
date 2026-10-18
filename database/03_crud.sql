-- Execute após 01_schema.sql e 02_seed.sql. Exemplos reais de DML.
-- CREATE / INSERT: cadastrar nova consulta com disponibilidade desocupada
INSERT INTO consultas (paciente_id,medico_id,disponibilidade_id,status)
SELECT p.id, d.medico_id, d.id,'AGENDADA'
FROM pacientes p JOIN disponibilidades d ON true
WHERE p.email='maria.exemplo@example.com'
 AND d.inicio=TIMESTAMPTZ '2026-11-05 09:30:00-03'
 AND NOT EXISTS (SELECT 1 FROM consultas c WHERE c.disponibilidade_id=d.id AND c.status IN ('AGENDADA','REALIZADA','FALTOU'))
RETURNING id, paciente_id, medico_id, disponibilidade_id, status;

-- READ / SELECT: agenda detalhada
SELECT c.id,p.nome AS paciente,m.nome AS medico,m.especialidade,
 d.inicio AT TIME ZONE 'America/Sao_Paulo' AS inicio_local,c.status
FROM consultas c
JOIN pacientes p ON p.id=c.paciente_id
JOIN medicos m ON m.id=c.medico_id
JOIN disponibilidades d ON d.id=c.disponibilidade_id
ORDER BY d.inicio,c.id;

-- READ / SELECT: horários livres (sem consulta ocupante)
SELECT d.id,m.nome AS medico,d.inicio AT TIME ZONE 'America/Sao_Paulo' AS inicio_local
FROM disponibilidades d JOIN medicos m ON m.id=d.medico_id
WHERE m.ativo AND NOT EXISTS (
 SELECT 1 FROM consultas c
 WHERE c.disponibilidade_id=d.id AND c.status IN ('AGENDADA','REALIZADA','FALTOU')
)
ORDER BY d.inicio;

-- UPDATE: cancelar consulta experimental de Maria
UPDATE consultas c SET status='CANCELADA'
FROM pacientes p WHERE p.id=c.paciente_id AND p.email='maria.exemplo@example.com'
 AND c.status='AGENDADA'
RETURNING c.id,c.status;

-- DELETE: remoção física de um registro CANCELADO (somente para demonstração)
DELETE FROM consultas c USING pacientes p
WHERE p.id=c.paciente_id AND p.email='maria.exemplo@example.com'
 AND c.status='CANCELADA'
RETURNING c.id,c.status;

-- SELECT de conferência final
SELECT status,COUNT(*) AS quantidade FROM consultas GROUP BY status ORDER BY status;
