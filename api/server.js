const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Verifica a conexão com o banco de dados
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", banco: "conectado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Falha na conexão com o banco" });
  }
});

// Retorna os médicos ativos cadastrados
app.get("/api/medicos", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, especialidade FROM medicos WHERE ativo = true ORDER BY nome",
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar médicos" });
  }
});

// Retorna os pacientes cadastrados
app.get("/api/pacientes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, email, telefone FROM pacientes ORDER BY nome",
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar pacientes" });
  }
});

// Consulta os agendamentos e seus dados relacionados
app.get("/api/consultas", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        c.id,
        c.paciente_id,
        c.medico_id,
        c.disponibilidade_id,
        p.nome AS paciente,
        m.nome AS medico,
        m.especialidade,
        d.inicio,
        d.fim,
        c.status
      FROM consultas c
      JOIN pacientes p ON p.id = c.paciente_id
      JOIN medicos m ON m.id = c.medico_id
      JOIN disponibilidades d ON d.id = c.disponibilidade_id
      ORDER BY d.inicio, c.id
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar consultas" });
  }
});

// Retorna os horários livres de um médico
app.get("/api/disponibilidades", async (req, res) => {
  try {
    const { medico_id } = req.query;

    if (!medico_id || !/^\d+$/.test(String(medico_id))) {
      return res.status(400).json({ erro: "Informe um medico_id válido" });
    }

    const resultado = await pool.query(
      `
      SELECT d.id, d.medico_id, d.inicio, d.fim
      FROM disponibilidades d
      WHERE d.medico_id = $1
        AND d.inicio >= NOW()
        AND NOT EXISTS (
          SELECT 1
          FROM consultas c
          WHERE c.disponibilidade_id = d.id
            AND c.status IN ('AGENDADA', 'REALIZADA', 'FALTOU')
        )
      ORDER BY d.inicio
      `,
      [medico_id],
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar disponibilidades" });
  }
});

// Registra um novo agendamento
app.post("/api/consultas", async (req, res) => {
  const { paciente_id, disponibilidade_id } = req.body;

  if (
    !Number.isSafeInteger(Number(paciente_id)) ||
    Number(paciente_id) <= 0 ||
    !Number.isSafeInteger(Number(disponibilidade_id)) ||
    Number(disponibilidade_id) <= 0
  ) {
    return res.status(400).json({
      erro: "Informe paciente_id e disponibilidade_id válidos",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Bloqueia o horário durante a transação para evitar concorrência
    const horario = await client.query(
      `SELECT id, medico_id, inicio
       FROM disponibilidades
       WHERE id = $1
       FOR UPDATE`,
      [disponibilidade_id],
    );

    if (horario.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        erro: "Horário não encontrado",
      });
    }

    if (new Date(horario.rows[0].inicio) <= new Date()) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        erro: "Não é possível agendar horários passados",
      });
    }

    const consulta = await client.query(
      `INSERT INTO consultas
         (paciente_id, medico_id, disponibilidade_id, status)
       VALUES ($1, $2, $3, 'AGENDADA')
       RETURNING id, paciente_id, medico_id,
                 disponibilidade_id, status`,
      [paciente_id, horario.rows[0].medico_id, disponibilidade_id],
    );

    await client.query("COMMIT");

    return res.status(201).json(consulta.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        erro: "Esse horário já está ocupado",
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        erro: "Paciente ou horário inválido",
      });
    }

    return res.status(500).json({
      erro: "Erro ao criar consulta",
    });
  } finally {
    client.release();
  }
});

// Cancela a consulta preservando seu histórico
app.patch("/api/consultas/:id/cancelar", async (req, res) => {
  const { id } = req.params;

  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      erro: "ID da consulta inválido",
    });
  }

  try {
    const resultado = await pool.query(
      `UPDATE consultas
       SET status = 'CANCELADA'
       WHERE id = $1 AND status = 'AGENDADA'
       RETURNING id, status`,
      [id],
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: "Consulta não encontrada ou não está agendada",
      });
    }

    res.json({
      mensagem: "Consulta cancelada com sucesso",
      consulta: resultado.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao cancelar consulta",
    });
  }
});
app.post("/api/pacientes", async (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  if (nome.length < 2 || nome.length > 120) {
    return res
      .status(400)
      .json({ erro: "Informe um nome entre 2 e 120 caracteres." });
  }
  try {
    const resultado = await pool.query(
      "INSERT INTO pacientes (nome) VALUES ($1) RETURNING id, nome",
      [nome],
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao cadastrar paciente." });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("API MediAgend iniciada na porta 3001");
});
