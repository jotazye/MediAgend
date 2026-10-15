import { useEffect, useState } from 'react';
import Logo from './components/Logo.jsx';

const MEDICOS = [
  { id: 'ana', nome: 'Dra. Ana Silva', especialidade: 'Clínico Geral' },
  { id: 'carlos', nome: 'Dr. Carlos Souza', especialidade: 'Pediatria' },
  { id: 'marina', nome: 'Dra. Marina Costa', especialidade: 'Medicina da Família' },
];
const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const hojeLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
};
const formatarData = (iso) => iso.split('-').reverse().join('/');

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

function Formulario({ consultas, adicionar, navegar }) {
  const [paciente,setPaciente]=useState('');
  const [medico,setMedico]=useState('');
  const [data,setData]=useState('');
  const [horario,setHorario]=useState('');
  const [erro,setErro]=useState('');
  const [sucesso,setSucesso]=useState('');
  const horariosDisponiveis = HORARIOS.filter(h=> !consultas.some(c=>c.medicoId===medico && c.data===data && c.horario===h));
  function enviar(e){
    e.preventDefault();setErro('');setSucesso('');
    if(!paciente.trim()||!medico||!data||!horario){setErro('Preencha todos os campos para continuar.');return;}
    if(paciente.trim().length<2){setErro('Informe um nome de paciente válido.');return;}
    const dataHora=new Date(`${data}T${horario}:00`);
    if(Number.isNaN(dataHora.getTime())||dataHora<=new Date()){setErro('Selecione uma data e um horário futuros.');return;}
    if(consultas.some(c=>c.medicoId===medico&&c.data===data&&c.horario===horario)){setErro('Este horário já está ocupado para o médico selecionado.');return;}
    adicionar({id:globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`,paciente:paciente.trim(),medicoId:medico,data,horario});
    setPaciente('');setMedico('');setData('');setHorario('');
    setSucesso('Consulta agendada com sucesso! Você pode conferir na lista de consultas.');
  }
  return <section className="card"><div className="secao-topo"><span className="eyebrow">Novo agendamento</span><h1>Agendar consulta</h1><p>Preencha os dados abaixo. Todos os campos são obrigatórios.</p></div>
    {erro&&<div role="alert" className="mensagem erro">{erro}</div>}
    {sucesso&&<div role="status" className="mensagem sucesso">{sucesso} <button type="button" className="link-button" onClick={()=>navegar('consultas')}>Ver consultas</button></div>}
    <form onSubmit={enviar} noValidate>
      <Campo id="paciente" label="Nome do paciente"><input id="paciente" name="paciente" value={paciente} onChange={e=>setPaciente(e.target.value)} autoComplete="name" required maxLength={90} placeholder="Digite o nome do paciente" /></Campo>
      <Campo id="medico" label="Médico"><select id="medico" name="medico" value={medico} onChange={e=>{setMedico(e.target.value);setHorario('');}} required><option value="">Selecione um médico</option>{MEDICOS.map(m=><option key={m.id} value={m.id}>{m.nome} — {m.especialidade}</option>)}</select></Campo>
      <div className="duas-colunas"><Campo id="data" label="Data da consulta"><input id="data" name="data" type="date" min={hojeLocal()} value={data} onChange={e=>{setData(e.target.value);setHorario('');}} required /></Campo>
      <Campo id="horario" label="Horário"><select id="horario" name="horario" value={horario} onChange={e=>setHorario(e.target.value)} disabled={!medico||!data} required><option value="">Selecione um horário</option>{horariosDisponiveis.map(h=><option key={h} value={h}>{h}</option>)}</select></Campo></div>
      <p className="ajuda">Os horários ocupados para o médico e a data selecionados não aparecem na lista.</p>
      <button className="botao primario" type="submit">Confirmar agendamento</button>
    </form>
  </section>;
}
function ListaConsultas({consultas,cancelar,navegar}) {
  const [busca,setBusca]=useState('');
  const filtradas=[...consultas].filter(c=>`${c.paciente} ${MEDICOS.find(m=>m.id===c.medicoId)?.nome??''}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))).sort((a,b)=>`${a.data}T${a.horario}`.localeCompare(`${b.data}T${b.horario}`));
  return <section className="card"><div className="secao-topo"><span className="eyebrow">Agenda</span><h1>Consultas agendadas</h1><p>Visualize os registros do protótipo e cancele agendamentos quando necessário.</p></div>
    <Campo id="busca" label="Buscar por paciente ou médico"><input id="busca" type="search" placeholder="Digite um nome para filtrar" value={busca} onChange={e=>setBusca(e.target.value)}/></Campo>
    {filtradas.length===0?<div className="vazio"><p>{consultas.length===0?'Nenhuma consulta agendada até o momento.':'Nenhuma consulta encontrada para sua busca.'}</p><button className="botao secundario" type="button" onClick={()=>navegar('agendar')}>Agendar consulta</button></div>:<ul className="lista-consultas">{filtradas.map(c=>{const m=MEDICOS.find(item=>item.id===c.medicoId);return <li className="consulta" key={c.id}><div><h2>{c.paciente}</h2><p><strong>Médico:</strong> {m?.nome}</p><p><strong>Especialidade:</strong> {m?.especialidade}</p><p><strong>Data:</strong> {formatarData(c.data)} <span aria-hidden="true">·</span> <strong>Horário:</strong> {c.horario}</p></div><button type="button" className="botao perigo" aria-label={`Cancelar consulta de ${c.paciente} em ${formatarData(c.data)} às ${c.horario}`} onClick={()=>{if(window.confirm(`Deseja cancelar a consulta de ${c.paciente}?`))cancelar(c.id);}}>Cancelar consulta</button></li>})}</ul>}
  </section>;
}
function Inicio({navegar,quantidade}) {return <section className="hero"><span className="eyebrow">Tecnologia a serviço da comunidade</span><h1>Agendamentos mais simples e organizados</h1><p>Protótipo acadêmico de uma aplicação web para facilitar o registro e o acompanhamento de consultas em unidades públicas de saúde.</p><div className="hero-acoes"><button type="button" className="botao primario" onClick={()=>navegar('agendar')}>Agendar consulta</button><button type="button" className="botao secundario" onClick={()=>navegar('consultas')}>Consultar agendamentos</button></div><div className="indicadores"><div><strong>{quantidade}</strong><span>Consultas nesta sessão</span></div><div><strong>3</strong><span>Médicos fictícios</span></div><div><strong>Web</strong><span>Interface responsiva</span></div></div></section>}
export default function App(){
  const [pagina,setPagina]=useState('inicio');
  const [tema,setTema]=useState(()=>{try{return localStorage.getItem('mediagend-tema')==='dark'?'dark':'light';}catch{return 'light';}});
  useEffect(()=>{document.documentElement.dataset.theme=tema;try{localStorage.setItem('mediagend-tema',tema);}catch{}},[tema]);
  const [consultas,setConsultas]=useState([]);
  return <div className="app"><a className="pular" href="#conteudo">Ir para o conteúdo principal</a><Cabecalho pagina={pagina} mudarPagina={setPagina} tema={tema} alternarTema={()=>setTema(atual=>atual==='light'?'dark':'light')}/><main id="conteudo" className="container conteudo" tabIndex="-1">{pagina==='inicio'?<Inicio navegar={setPagina} quantidade={consultas.length}/>:pagina==='agendar'?<Formulario consultas={consultas} adicionar={c=>setConsultas(prev=>[...prev,c])} navegar={setPagina}/>:<ListaConsultas consultas={consultas} cancelar={id=>setConsultas(prev=>prev.filter(c=>c.id!==id))} navegar={setPagina}/>}</main><footer className="rodape"><div className="container"><strong>MediAgend</strong><span>Protótipo acadêmico — UFMS 2026 · Dados fictícios e temporários · Não destinado ao uso clínico real</span></div></footer></div>;
}
