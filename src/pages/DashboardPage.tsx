// pages/DashboardPage.tsx
import { useState } from 'react';
import { useAuthStore, selectUser } from '../auth/authStore';
import { useAuth } from '../auth/AuthContext';

// ─── Mock data — substitua por useQuery do Apollo ────────────────────────────

const STATS = [
  { label: 'Receita Mensal', value: 'R$ 84.320', delta: '+12,4%', up: true },
  { label: 'Usuários Ativos', value: '3.291', delta: '+8,1%', up: true },
  { label: 'Tickets Abertos', value: '47', delta: '-3,2%', up: false },
  { label: 'Uptime', value: '99,98%', delta: '+0,02%', up: true },
];

const ACTIVITY = [
  { id: 1, user: 'Ana Costa', action: 'criou um novo pedido', time: '2 min atrás', avatar: 'AC' },
  { id: 2, user: 'Bruno Lima', action: 'atualizou perfil', time: '14 min atrás', avatar: 'BL' },
  { id: 3, user: 'Carla Dias', action: 'abriu ticket #4821', time: '31 min atrás', avatar: 'CD' },
  { id: 4, user: 'Diego Ramos', action: 'fechou ticket #4799', time: '1h atrás', avatar: 'DR' },
  { id: 5, user: 'Elena Souza', action: 'realizou pagamento', time: '2h atrás', avatar: 'ES' },
];

const NAV_ITEMS = [
  { icon: '⬡', label: 'Dashboard', active: true },
  { icon: '◈', label: 'Usuários', active: false },
  { icon: '◇', label: 'Pedidos', active: false },
  { icon: '◉', label: 'Relatórios', active: false },
  { icon: '◎', label: 'Configurações', active: false },
];

// ─── Sparkline SVG simples (sem lib externa) ─────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore(selectUser);
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #0c0c0f;
          --surface:  #131318;
          --border:   #1e1e28;
          --border-2: #2a2a38;
          --text:     #e8e8f0;
          --muted:    #6b6b82;
          --accent:   #c8f060;
          --accent-2: #60c8f0;
          --danger:   #f06060;
          --font-display: 'Syne', sans-serif;
          --font-mono:    'DM Mono', monospace;
        }

        body { background: var(--bg); color: var(--text); }

        .dash-root {
          display: flex;
          min-height: 100vh;
          font-family: var(--font-mono);
          background: var(--bg);
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 28px 0;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 10;
        }

        .sidebar-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.5px;
          color: var(--accent);
          padding: 0 24px 32px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-logo span { color: var(--muted); }

        .sidebar-nav {
          flex: 1;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 400;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid transparent;
          letter-spacing: 0.02em;
        }

        .nav-item:hover {
          color: var(--text);
          background: var(--border);
        }

        .nav-item.active {
          color: var(--accent);
          background: rgba(200, 240, 96, 0.07);
          border-color: rgba(200, 240, 96, 0.15);
        }

        .nav-icon { font-size: 15px; width: 20px; text-align: center; }

        .sidebar-footer {
          padding: 16px 12px 0;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          font-family: var(--font-mono);
          letter-spacing: 0.02em;
        }

        .logout-btn:hover:not(:disabled) {
          color: var(--danger);
          background: rgba(240, 96, 96, 0.07);
        }

        .logout-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Main ── */
        .main {
          margin-left: 220px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ── Header ── */
        .header {
          padding: 28px 40px 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
        }

        .header-greeting {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .header-greeting span { color: var(--accent); }

        .header-sub {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
          letter-spacing: 0.05em;
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--border-2);
          border-radius: 20px;
          padding: 8px 14px;
          font-size: 12px;
          color: var(--muted);
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .badge-role {
          background: rgba(200, 240, 96, 0.1);
          color: var(--accent);
          border: 1px solid rgba(200, 240, 96, 0.2);
          border-radius: 4px;
          padding: 2px 7px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ── Content ── */
        .content {
          padding: 32px 40px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px;
          font-weight: 500;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 14px;
        }

        /* ── Stats grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .stat-card:hover { border-color: var(--border-2); }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .stat-card:hover::before { opacity: 1; }

        .stat-label {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .stat-delta {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 7px;
          border-radius: 4px;
          margin-top: 6px;
          display: inline-block;
        }

        .delta-up {
          color: var(--accent);
          background: rgba(200, 240, 96, 0.1);
        }

        .delta-down {
          color: var(--danger);
          background: rgba(240, 96, 96, 0.1);
        }

        /* ── Lower grid ── */
        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 16px;
        }

        /* ── Activity feed ── */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 24px;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 20px;
          letter-spacing: -0.2px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 0;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }

        .activity-item:last-child { border-bottom: none; }

        .avatar {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--border-2), var(--border));
          border: 1px solid var(--border-2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 500;
          color: var(--muted);
          flex-shrink: 0;
          letter-spacing: 0.05em;
        }

        .activity-body { flex: 1; min-width: 0; }

        .activity-user {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .activity-action {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-time {
          font-size: 11px;
          color: var(--muted);
          white-space: nowrap;
          opacity: 0.7;
        }

        /* ── System status ── */
        .status-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-name { font-size: 12px; color: var(--muted); }
        .status-val  { font-size: 12px; color: var(--text); font-weight: 500; }

        .progress-track {
          height: 3px;
          background: var(--border-2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.8s ease;
        }

        /* ── Token info ── */
        .token-card {
          background: rgba(200, 240, 96, 0.03);
          border: 1px solid rgba(200, 240, 96, 0.12);
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .token-label { font-size: 11px; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }
        .token-value { font-size: 12px; color: var(--accent); margin-top: 4px; }
      `}</style>

      <div className="dash-root">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            sys<span>.</span>core
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              className="logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <span className="nav-icon">⊗</span>
              {loggingOut ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────── */}
        <main className="main">

          {/* Header */}
          <header className="header">
            <div>
              <div className="header-greeting">
                {greeting}, <span>{user?.email?.split('@')[0] ?? 'usuário'}</span>
              </div>
              <div className="header-sub">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* {user?.roles?.map((role) => (
                <span key={role} className="badge-role">{role}</span>
              ))} */}
              LEOMAR
              <div className="header-badge">
                <span className="badge-dot" />
                leomar_sartor
                {/* <span>{user?.email ?? '—'}</span> */}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="content">

            {/* Stats */}
            <section>
              <div className="section-label">visão geral</div>
              <div className="stats-grid">
                {STATS.map((s, i) => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-bottom">
                      <div>
                        <div className="stat-value">{s.value}</div>
                        <span className={`stat-delta ${s.up ? 'delta-up' : 'delta-down'}`}>
                          {s.delta}
                        </span>
                      </div>
                      <Sparkline
                        data={[40, 55, 45, 60, 50, 70, 65, 80, 75, 90].map(
                          (v) => v + (i * 7)
                        )}
                        color={s.up ? 'var(--accent)' : 'var(--danger)'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lower grid */}
            <div className="lower-grid">

              {/* Activity feed */}
              <div className="card">
                <div className="card-title">Atividade Recente</div>
                <div className="activity-list">
                  {ACTIVITY.map((a) => (
                    <div key={a.id} className="activity-item">
                      <div className="avatar">{a.avatar}</div>
                      <div className="activity-body">
                        <div className="activity-user">{a.user}</div>
                        <div className="activity-action">{a.action}</div>
                      </div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* System status */}
                <div className="card">
                  <div className="card-title">Status do Sistema</div>
                  <div className="status-list">
                    {[
                      { name: 'API GraphQL', val: '99,98%', pct: 99.98, color: 'var(--accent)' },
                      { name: 'Banco de Dados', val: '87 ms', pct: 82, color: 'var(--accent-2)' },
                      { name: 'Cache (Redis)', val: '12 ms', pct: 95, color: 'var(--accent)' },
                      { name: 'Storage', val: '64%', pct: 64, color: '#f0c060' },
                    ].map((s) => (
                      <div key={s.name} className="status-item">
                        <div className="status-row">
                          <span className="status-name">{s.name}</span>
                          <span className="status-val">{s.val}</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${s.pct}%`, background: s.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session info — dados reais do Zustand */}
                <div className="card">
                  <div className="card-title">Sessão Atual</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="token-card">
                      <div>
                        <div className="token-label">User ID</div>
                        <div className="token-value">{user?.id ?? '—'}</div>
                      </div>
                    </div>
                    <div className="token-card">
                      <div>
                        <div className="token-label">Roles</div>
                        <div className="token-value">
                          {user?.roles?.join(', ') ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="token-card">
                      <div>
                        <div className="token-label">Access Token</div>
                        <div className="token-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                          ••••••••••••••••••••••
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--accent)', opacity: 0.7 }}>
                        em memória
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}