-- MediAgend: PostgreSQL 15+ | execute em um banco de testes vazio.
BEGIN;
CREATE TABLE pacientes (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 nome VARCHAR(120) NOT NULL CHECK (length(btrim(nome)) >= 2),
 email VARCHAR(160) UNIQUE,
 telefone VARCHAR(20),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE medicos (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 nome VARCHAR(120) NOT NULL CHECK (length(btrim(nome)) >= 2),
 especialidade VARCHAR(100) NOT NULL,
 ativo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE disponibilidades (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 medico_id BIGINT NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
 inicio TIMESTAMPTZ NOT NULL,
 fim TIMESTAMPTZ NOT NULL,
 CONSTRAINT chk_intervalo_disponibilidade CHECK (fim > inicio),
 CONSTRAINT unq_medico_inicio_disponibilidade UNIQUE (medico_id, inicio),
 CONSTRAINT unq_id_medico_disponibilidade UNIQUE (id, medico_id)
);
CREATE TABLE consultas (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
 medico_id BIGINT NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
 disponibilidade_id BIGINT NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'AGENDADA' CHECK (status IN ('AGENDADA','CANCELADA','REALIZADA','FALTOU')),
 observacao VARCHAR(300),
 criada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_consulta_horario_medico FOREIGN KEY (disponibilidade_id, medico_id)
  REFERENCES disponibilidades(id, medico_id) ON DELETE RESTRICT
);
-- A mesma disponibilidade pode ter várias consultas históricas canceladas,
-- mas no máximo uma reserva ativa/realizada para evitar agendamento duplo.
CREATE UNIQUE INDEX uq_consulta_horario_ocupado
 ON consultas(disponibilidade_id) WHERE status IN ('AGENDADA','REALIZADA','FALTOU');
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_disponibilidades_inicio ON disponibilidades(inicio);
COMMIT;
