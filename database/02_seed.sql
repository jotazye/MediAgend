-- Dados totalmente fictícios, apenas para demonstrar o funcionamento.
BEGIN;
INSERT INTO pacientes (nome,email,telefone) VALUES
 ('João Teste','joao.teste@example.com','11999990001'),
 ('Maria Exemplo','maria.exemplo@example.com','11999990002'),
 ('Pedro Fictício','pedro.ficticio@example.com',NULL);
INSERT INTO medicos (nome,especialidade) VALUES
 ('Dra. Ana Silva','Clínica Geral'),
 ('Dr. Carlos Souza','Pediatria'),
 ('Dra. Mariana Lima','Dermatologia');
INSERT INTO disponibilidades (medico_id,inicio,fim)
 SELECT m.id, v.inicio, v.inicio + INTERVAL '30 minutes'
 FROM medicos m
 JOIN (VALUES
 ('Dra. Ana Silva',TIMESTAMPTZ '2026-11-05 09:00:00-03'),
 ('Dra. Ana Silva',TIMESTAMPTZ '2026-11-05 09:30:00-03'),
 ('Dr. Carlos Souza',TIMESTAMPTZ '2026-11-05 10:00:00-03'),
 ('Dra. Mariana Lima',TIMESTAMPTZ '2026-11-05 11:00:00-03')
 ) AS v(nome,inicio) ON m.nome = v.nome;
INSERT INTO consultas (paciente_id,medico_id,disponibilidade_id,status)
 SELECT p.id,m.id,d.id,'AGENDADA'
 FROM pacientes p CROSS JOIN medicos m JOIN disponibilidades d ON d.medico_id=m.id
 WHERE p.email='joao.teste@example.com' AND m.nome='Dra. Ana Silva'
   AND d.inicio=TIMESTAMPTZ '2026-11-05 09:00:00-03';
COMMIT;
