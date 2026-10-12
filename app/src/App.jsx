import { useState } from "react";
import "./App.css";

const medicos = [
  { id: 1, nome: "Dra. Ana Silva", especialidade: "Clínico Geral" },
  { id: 2, nome: "Dr. Carlos Souza", especialidade: "Pediatria" },
  { id: 3, nome: "Dra. Mariana Costa", especialidade: "Cardiologia" },
];

const horarios = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
];

function App() {
  const [pagina, setPagina] = useState("inicio");
  const [consultas, setConsultas] = useState([]);
  const [paciente, setPaciente] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [mensagem, setMensagem] = useState("");

  function navegar(destino) {
    setPagina(destino);
    setMensagem("");
  }

  function agendar(e) {
    e.preventDefault();

    if (!paciente.trim() || !medicoId || !data || !horario) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    const dataHora = new Date(`${data}T${horario}:00`);

    if (dataHora <= new Date()) {
      setMensagem("Escolha uma data e horário futuros.");
      return;
    }

    const conflito = consultas.some(
      (consulta) =>
        consulta.medicoId === Number(medicoId) &&
        consulta.data === data &&
        consulta.horario === horario,
    );

    if (conflito) {
      setMensagem("Este horário já está ocupado para o médico selecionado.");
      return;
    }

    const medico = medicos.find((m) => m.id === Number(medicoId));

    const novaConsulta = {
      id: crypto.randomUUID(),
      paciente: paciente.trim(),
      medicoId: medico.id,
      medico: medico.nome,
      especialidade: medico.especialidade,
      data,
      horario,
    };

    setConsultas([...consultas, novaConsulta]);
    setPaciente("");
    setMedicoId("");
    setData("");
    setHorario("");
    setMensagem("");
    setPagina("consultas");
  }

  function cancelar(id) {
    if (window.confirm("Deseja cancelar esta consulta?")) {
      setConsultas(consultas.filter((consulta) => consulta.id !== id));
    }
  }

  function formatarData(valor) {
    return new Date(`${valor}T12:00:00`).toLocaleDateString("pt-BR");
  }

  return (
    <div className="container">
      <header>
        <h1>MediAgend</h1>
        <p>Sistema de Agendamento de Consultas</p>
      </header>

      <nav className="acoes">
        <button onClick={() => navegar("inicio")}>Início</button>
        <button onClick={() => navegar("agendar")}>Agendar consulta</button>
        <button onClick={() => navegar("consultas")}>
          Consultar agendamentos
        </button>
      </nav>

      <main>
        {pagina === "inicio" && (
          <section>
            <h2>Bem-vindo ao MediAgend</h2>
            <p>
              Uma solução para facilitar o agendamento de consultas em postos de
              saúde públicos.
            </p>
            <p>Selecione uma opção no menu para começar.</p>
          </section>
        )}

        {pagina === "agendar" && (
          <section>
            <h2>Agendar consulta</h2>

            <form onSubmit={agendar} className="formulario">
              <label htmlFor="paciente">Nome do paciente</label>
              <input
                id="paciente"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                placeholder="Digite o nome do paciente"
                required
              />

              <label htmlFor="medico">Médico</label>
              <select
                id="medico"
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
                required
              >
                <option value="">Selecione um médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nome} — {medico.especialidade}
                  </option>
                ))}
              </select>

              <label htmlFor="data">Data da consulta</label>
              <input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />

              <label htmlFor="horario">Horário</label>
              <select
                id="horario"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              >
                <option value="">Selecione um horário</option>
                {horarios.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              {mensagem && <p className="erro">{mensagem}</p>}

              <button type="submit">Confirmar agendamento</button>
            </form>
          </section>
        )}

        {pagina === "consultas" && (
          <section>
            <h2>Consultas agendadas</h2>

            {consultas.length === 0 ? (
              <p>Nenhuma consulta agendada.</p>
            ) : (
              <div className="lista-consultas">
                {consultas.map((consulta) => (
                  <article className="consulta" key={consulta.id}>
                    <h3>{consulta.paciente}</h3>
                    <p>
                      <strong>Médico:</strong> {consulta.medico}
                    </p>
                    <p>
                      <strong>Especialidade:</strong> {consulta.especialidade}
                    </p>
                    <p>
                      <strong>Data:</strong> {formatarData(consulta.data)}
                    </p>
                    <p>
                      <strong>Horário:</strong> {consulta.horario}
                    </p>
                    <button
                      className="cancelar"
                      onClick={() => cancelar(consulta.id)}
                    >
                      Cancelar consulta
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <p className="aviso">Protótipo acadêmico — UFMS 2026</p>
      </main>
    </div>
  );
}

export default App;
