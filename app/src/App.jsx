import { useEffect, useState } from 'react';
import Logo from './components/Logo.jsx';

const API = 'http://localhost:3001/api';
const ZONA = 'America/Sao_Paulo';

const hojeLocal = () => {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const p = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${p.year}-${p.month}-${p.day}`;
};
const partesData = (iso) => {
  const partes = new Intl.DateTimeFormat('en-GB', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const p = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return { data: `${p.year}-${p.month}-${p.day}`, horario: `${p.hour}:${p.minute}` };
};
const formatarData = (iso) => iso.split('-').reverse().join('/');

async function requisicao(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
    });
  } catch {
    throw new Error('Não foi possível acessar a API. Verifique se node server.js está funcionando.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || `Erro HTTP ${resposta.status}`);
  return dados;
}

function Cabecalho({ pagina, mudarPagina, tema, alternarTema }) {
  return <header className="site-header">
    <div className="container cabecalho-interno">
      <Logo />
      <nav aria-label="Navegação principal" className="navegacao">
        {[['inicio','Início'],['agendar','Agendar consulta'],['consultas','Consultas agendadas']].map(([id, titulo]) => <button key={id} type="button" className={pagina===id?'nav-item ativo':'nav-item'} aria-current={pagina===id?'page':undefined} onClick={()=>mudarPagina(id)}>{titulo}</button>)}
      </nav>
      <button type="button" className="tema-botao" onClick={alternarTema} aria-label={tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-pressed={tema === 'dark'}>{tema === 'dark' ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.3 15.8A9 9 0 0 1 8.2 3.7 9 9 0 1 0 20.3 15.8Z"/></svg>}</button>
    </div>
  </header>;
}
function Campo({ id, label, children }) { return <div className="campo"><label htmlFor={id}>{label}</label>{children}</div>; }


// Calendário visual com dias livres recebidos da API PostgreSQL.
function CalendarioDisponibilidade({ medico, disponibilidades, carregando, data, selecionarData }) {
  const datasLivres = [...new Set(disponibilidades.map(d => partesData(d.inicio).data))]
    .filter(d => d >= hojeLocal()).sort();
  const primeira = datasLivres[0] || hojeLocal();
  const [mes, setMes] = useState(() => hojeLocal().slice(0, 7));
  useEffect(() => { setMes(primeira.slice(0, 7)); }, [medico, primeira]);
  const [ano, numeroMes] = mes.split('-').map(Number);
  const primeiroDia = new Date(ano, numeroMes - 1, 1).getDay();
  const totalDias = new Date(ano, numeroMes, 0).getDate();
  const ultimoMes = datasLivres.length ? datasLivres[datasLivres.length - 1].slice(0, 7) : mes;
  const limiteInferior = hojeLocal().slice(0, 7);
  const mesAnterior = new Date(ano, numeroMes - 2, 1);
  const mesSeguinte = new Date(ano, numeroMes, 1);
  const mudarMes = (dt) => setMes(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  const diasLivresSet = new Set(datasLivres);
  const tituloMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(ano, numeroMes - 1, 1));
  return <div className="campo">
    <span id="calendario-label" className="calendario-rotulo">Data da consulta</span>
    <div className="calendario-agenda" role="group" aria-labelledby="calendario-label">
      <div className="calendario-topo">
        <strong>{tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}</strong>
        <div className="calendario-navegacao">
          <button type="button" aria-label="Mês anterior" onClick={() => mudarMes(mesAnterior)} disabled={mes <= limiteInferior}>‹</button>
          <button type="button" aria-label="Próximo mês" onClick={() => mudarMes(mesSeguinte)} disabled={!datasLivres.length || mes >= ultimoMes}>›</button>
        </div>
      </div>
      <div className="calendario-grade">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span className="calendario-semana" key={d}>{d}</span>)}
        {Array.from({ length: primeiroDia }, (_, i) => <span key={`vazio-${i}`} />)}
        {Array.from({ length: totalDias }, (_, i) => {
          const dia = String(i + 1).padStart(2, '0');
          const iso = `${mes}-${dia}`;
          const livre = diasLivresSet.has(iso);
          return <button type="button" key={iso} disabled={!livre || carregando || !medico}
            aria-label={`${formatarData(iso)}${livre ? ', com horários disponíveis' : ', sem horários disponíveis'}`}
            aria-pressed={data === iso}
            title={livre ? 'Horários disponíveis' : 'Sem disponibilidade'}
            className={`calendario-dia ${livre ? 'livre' : 'indisponivel'} ${data === iso ? 'selecionado' : ''}`}
            onClick={() => selecionarData(iso)}>{i + 1}{livre && <span className="calendario-ponto" aria-hidden="true" />}</button>;
        })}
      </div>
      <div className="calendario-legenda"><span className="legenda-ponto" /> Com horários <span className="legenda-bloqueado" /> Sem horários</div>
    </div>
    {!medico ? <p className="ajuda">Selecione um médico para consultar a agenda.</p>
      : carregando ? <p className="ajuda" role="status">Buscando dias disponíveis...</p>
      : datasLivres.length ? <p className="ajuda" role="status">Próxima data disponível: <strong>{formatarData(primeira)}</strong>. Selecione um dia marcado em verde.</p>
      : <p className="ajuda" role="status">Este médico não possui horários livres futuros cadastrados.</p>}
  </div>;
}

function Formulario({ medicos, atualizar, navegar }) {
  const [paciente, setPaciente] = useState('');
  const [medico, setMedico] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    if (!medico) { setDisponibilidades([]); setCarregandoHorarios(false); return; }
    let ativo = true;
    setDisponibilidades([]);
    setCarregandoHorarios(true);
    setErro('');
    requisicao(`/disponibilidades?medico_id=${medico}`)
      .then(dados => { if (ativo) setDisponibilidades(dados); })
      .catch(e => { if (ativo) setErro(e.message); })
      .finally(() => { if (ativo) setCarregandoHorarios(false); });
    return () => { ativo = false; };
  }, [medico]);

  const horariosDisponiveis = disponibilidades.filter(d => partesData(d.inicio).data === data);

  async function enviar(e) {
    e.preventDefault(); setErro(''); setSucesso('');
    if (!paciente.trim() || !medico || !data || !horario) { setErro('Preencha todos os campos para continuar.'); return; }
    if (paciente.trim().length < 2) { setErro('Informe um nome de paciente válido.'); return; }
    const disponibilidade = horariosDisponiveis.find(d => String(d.id) === horario);
    if (!disponibilidade) { setErro('Selecione um horário disponível.'); return; }
    setSalvando(true);
    try {
      // API cria um registro fictício para o nome digitado.
      const novoPaciente = await requisicao('/pacientes', {
        method: 'POST', body: JSON.stringify({ nome: paciente.trim() }),
      });
      await requisicao('/consultas', {
        method: 'POST', body: JSON.stringify({
          paciente_id: novoPaciente.id,
          disponibilidade_id: disponibilidade.id,
        }),
      });
      await atualizar();
      setPaciente(''); setMedico(''); setData(''); setHorario('');
      setSucesso('Consulta agendada com sucesso! Você pode conferir na lista de consultas.');
    } catch (e) {
      setErro(e.message);
      // Atualiza a lista de horários após uma tentativa concorrente.
      if (medico) {
        requisicao(`/disponibilidades?medico_id=${medico}`).then(setDisponibilidades).catch(() => {});
      }
    } finally { setSalvando(false); }
  }
  return <section className="card"><div className="secao-topo"><span className="eyebrow">Novo agendamento</span><h1>Agendar consulta</h1><p>Preencha os dados abaixo. Todos os campos são obrigatórios.</p></div>
    {erro && <div role="alert" className="mensagem erro">{erro}</div>}
    {sucesso && <div role="status" className="mensagem sucesso">{sucesso} <button type="button" className="link-button" onClick={() => navegar('consultas')}>Ver consultas</button></div>}
    <form onSubmit={enviar} noValidate>
      <Campo id="paciente" label="Nome do paciente"><input id="paciente" name="paciente" value={paciente} onChange={e => setPaciente(e.target.value)} autoComplete="name" required maxLength={90} placeholder="Digite o nome do paciente" /></Campo>
      <Campo id="medico" label="Médico"><select id="medico" name="medico" value={medico} onChange={e => {setMedico(e.target.value);setData('');setHorario('');}} required><option value="">Selecione um médico</option>{medicos.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.especialidade}</option>)}</select></Campo>
      <div className="duas-colunas"><CalendarioDisponibilidade medico={medico} disponibilidades={disponibilidades} carregando={carregandoHorarios} data={data} selecionarData={novaData => {setData(novaData);setHorario('');}} />
      <Campo id="horario" label="Horário"><select id="horario" name="horario" value={horario} onChange={e => setHorario(e.target.value)} disabled={!medico || !data || carregandoHorarios} required><option value="">{carregandoHorarios ? 'Carregando horários...' : 'Selecione um horário'}</option>{horariosDisponiveis.map(d => <option key={d.id} value={d.id}>{partesData(d.inicio).horario}</option>)}</select></Campo></div>
      <p className="ajuda">Os dias marcados em verde têm horários livres no PostgreSQL. Escolha um dia e depois um horário.</p>
      <button className="botao primario" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Confirmar agendamento'}</button>
    </form>
  </section>;
}
function ListaConsultas({ consultas, cancelar, navegar, carregando }) {
  const [busca, setBusca] = useState('');
  const [cancelando, setCancelando] = useState(null);
  const [erro, setErro] = useState('');
  const filtradas = consultas.filter(c => `${c.paciente} ${c.medico}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))).sort((a,b) => new Date(a.inicio) - new Date(b.inicio));
  async function cancelarConfirmado(c) {
    if (!window.confirm(`Deseja cancelar a consulta de ${c.paciente}?`)) return;
    setErro(''); setCancelando(c.id);
    try { await cancelar(c.id); }
    catch (e) { setErro(e.message); }
    finally { setCancelando(null); }
  }
  return <section className="card"><div className="secao-topo"><span className="eyebrow">Agenda</span><h1>Consultas agendadas</h1><p>Visualize os registros salvos no PostgreSQL e cancele agendamentos quando necessário.</p></div>
    {erro && <div role="alert" className="mensagem erro">{erro}</div>}
    <Campo id="busca" label="Buscar por paciente ou médico"><input id="busca" type="search" placeholder="Digite um nome para filtrar" value={busca} onChange={e => setBusca(e.target.value)}/></Campo>
    {carregando ? <p>Carregando consultas...</p> : filtradas.length === 0 ? <div className="vazio"><p>{consultas.length === 0 ? 'Nenhuma consulta agendada até o momento.' : 'Nenhuma consulta encontrada para sua busca.'}</p><button className="botao secundario" type="button" onClick={() => navegar('agendar')}>Agendar consulta</button></div> : <ul className="lista-consultas">{filtradas.map(c => { const d = partesData(c.inicio); return <li className="consulta" key={c.id}><div><h2>{c.paciente}</h2><p><strong>Médico:</strong> {c.medico}</p><p><strong>Especialidade:</strong> {c.especialidade}</p><p><strong>Data:</strong> {formatarData(d.data)} <span aria-hidden="true">·</span> <strong>Horário:</strong> {d.horario}</p></div><button type="button" className="botao perigo" disabled={cancelando === c.id} aria-label={`Cancelar consulta de ${c.paciente} em ${formatarData(d.data)} às ${d.horario}`} onClick={() => cancelarConfirmado(c)}>{cancelando === c.id ? 'Cancelando...' : 'Cancelar consulta'}</button></li>; })}</ul>}
  </section>;
}
function Inicio({ navegar, quantidade, totalMedicos }) {return <section className="hero"><span className="eyebrow">Tecnologia a serviço da comunidade</span><h1>Agendamentos mais simples e organizados</h1><p>Protótipo acadêmico de uma aplicação web para facilitar o registro e o acompanhamento de consultas em unidades públicas de saúde.</p><div className="hero-acoes"><button type="button" className="botao primario" onClick={() => navegar('agendar')}>Agendar consulta</button><button type="button" className="botao secundario" onClick={() => navegar('consultas')}>Consultar agendamentos</button></div><div className="indicadores"><div><strong>{quantidade}</strong><span>Consultas agendadas</span></div><div><strong>{totalMedicos}</strong><span>Médicos fictícios</span></div><div><strong>Web</strong><span>Interface responsiva</span></div></div></section>;}
export default function App() {
  const [pagina, setPagina] = useState('inicio');
  const [tema, setTema] = useState(() => {try{return localStorage.getItem('mediagend-tema') === 'dark' ? 'dark' : 'light';}catch{return 'light';}});
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState('');
  useEffect(() => {document.documentElement.dataset.theme = tema;try{localStorage.setItem('mediagend-tema',tema);}catch{}}, [tema]);
  async function atualizar() {
    const dados = await requisicao('/consultas');
    setConsultas(dados.filter(c => c.status === 'AGENDADA'));
  }
  useEffect(() => {
    let ativo = true;
    Promise.all([requisicao('/medicos'), requisicao('/consultas')])
      .then(([listaMedicos, listaConsultas]) => {
        if (!ativo) return;
        setMedicos(listaMedicos);
        setConsultas(listaConsultas.filter(c => c.status === 'AGENDADA'));
      })
      .catch(e => {if (ativo) setErroGeral(e.message);})
      .finally(() => {if (ativo) setCarregando(false);});
    return () => {ativo = false;};
  }, []);
  async function cancelar(id) {
    await requisicao(`/consultas/${id}/cancelar`, { method: 'PATCH' });
    await atualizar();
  }
  return <div className="app"><a className="pular" href="#conteudo">Ir para o conteúdo principal</a><Cabecalho pagina={pagina} mudarPagina={setPagina} tema={tema} alternarTema={() => setTema(atual => atual === 'light' ? 'dark' : 'light')}/><main id="conteudo" className="container conteudo" tabIndex="-1">{erroGeral && <div role="alert" className="mensagem erro">{erroGeral}</div>}{pagina === 'inicio' ? <Inicio navegar={setPagina} quantidade={consultas.length} totalMedicos={medicos.length}/> : pagina === 'agendar' ? <Formulario medicos={medicos} atualizar={atualizar} navegar={setPagina}/> : <ListaConsultas consultas={consultas} cancelar={cancelar} navegar={setPagina} carregando={carregando}/>}</main><footer className="rodape"><div className="container"><strong>MediAgend</strong><span>Protótipo acadêmico — UFMS 2026 · Dados fictícios em banco local · Não destinado ao uso clínico real</span></div></footer></div>;
}
