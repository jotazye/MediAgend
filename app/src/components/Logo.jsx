export default function Logo() {
  return (
    <div className="marca" aria-label="MediAgend — Agendamento de consultas">
      <svg className="logo-simbolo" viewBox="0 0 64 64" aria-hidden="true" fill="none">
        <path d="M11 17a6 6 0 0 1 6-6h30a6 6 0 0 1 6 6v26" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M11 24h42M11 17v30a6 6 0 0 0 6 6h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M21 7v9M43 7v9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <rect x="18" y="30" width="8" height="8" rx="2" fill="#14B8A6" />
        <rect x="30" y="30" width="8" height="8" rx="2" fill="currentColor" opacity=".45" />
        <rect x="18" y="42" width="8" height="7" rx="2" fill="currentColor" opacity=".45" />
        <path d="M49 37v18M40 46h18" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <div className="marca-palavras"><strong><span>Medi</span><span>Agend</span></strong><small>Agendamento de consultas</small></div>
    </div>
  );
}
