import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import logo from '../assets/logo.png';
import { api, auth } from '../api/api.js';

// Layout com menu lateral, usado por todas as telas internas (exceto o Estúdio).
export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(null);

  // Atualiza o contador de aprovações ao mudar de tela ou quando uma peça é aprovada/reprovada.
  useEffect(() => {
    const refresh = () => api.listApprovals().then((list) => setPending(list.length)).catch(() => setPending(null));
    refresh();
    window.addEventListener('formula:approvals-changed', refresh);
    return () => window.removeEventListener('formula:approvals-changed', refresh);
  }, [location.pathname]);

  const logout = () => {
    auth.clear();
    navigate('/');
  };

  const links = [
    { to: '/app', label: 'Início', icon: 'home', end: true },
    { to: '/app/campanhas/nova', label: 'Nova campanha', icon: 'plusCircle' },
    { to: '/app/criacoes', label: 'Criações', icon: 'grid' },
    { to: '/app/aprovacoes', label: 'Aprovações', icon: 'checkCircle', count: pending },
    { to: '/app/regras', label: 'Regras da marca', icon: 'book' },
  ];

  return (
    <div className="app-shell">
      <nav className="sidebar" aria-label="Menu">
        <NavLink to="/app" className="sidebar-logo" aria-label="Formula, início">
          <img src={logo} alt="Formula" />
        </NavLink>
        <div className="sidebar-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon name={l.icon} />
              {l.label}
              {l.count ? <span className="count">{l.count}</span> : null}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button type="button" className="nav-link" onClick={logout}>
            <Icon name="logout" />
            Sair
          </button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
