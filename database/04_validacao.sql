-- Validação: execute após schema + seed e antes do CRUD, ou depois dele.
-- A query retorna 0 linhas se não houver duplicidade de agendamentos ocupantes.
SELECT disponibilidade_id,COUNT(*) AS reservas_ocupantes
FROM consultas WHERE status IN ('AGENDADA','REALIZADA','FALTOU')
GROUP BY disponibilidade_id HAVING COUNT(*) > 1;
-- Confere integridade relacional e número de registros atuais
SELECT 'pacientes' AS entidade,COUNT(*) AS total FROM pacientes
UNION ALL SELECT 'medicos',COUNT(*) FROM medicos
UNION ALL SELECT 'disponibilidades',COUNT(*) FROM disponibilidades
UNION ALL SELECT 'consultas',COUNT(*) FROM consultas;
-- Para testar manualmente a restrição UNIQUE, tente registrar duas consultas
-- AGENDADAS para a mesma disponibilidade: a segunda deve falhar.
