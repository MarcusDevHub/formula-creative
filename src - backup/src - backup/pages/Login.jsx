import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import logo from '../assets/logo.png';
import { api, auth, isMock } from '../api/api.js';
import '../styles/landing.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('marketing@formula.ai');
  const [password, setPassword] = useState('••••••••');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(email, password);
      auth.set(token);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // No app real, o SSO redireciona para o login da empresa (ex.: Microsoft / Google).
  const sso = () => {
    if (isMock) navigate('/app');
    else window.location.href = `${import.meta.env.VITE_API_URL}/auth/sso`;
  };

  return (
    <div className="login">
      <main className="login-main">
        <Link to="/" aria-label="Formula, página inicial"><img src={logo} alt="Formula, a dose certa de criatividade" /></Link>

        <div className="login-box">
          <div className="stack" style={{ gap: 12 }}>
            <span className="pill-tag" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '7px 14px' }}>
              <span className="red-dot" />ÁREA DO COLABORADOR
            </span>
            <h1>Bom te ver <span className="gradient-text">por aqui.</span></h1>
            <p>Entre com sua conta corporativa para criar, revisar e aprovar campanhas.</p>
          </div>

          <form onSubmit={submit} className="stack" style={{ gap: 18 }}>
            <label className="field" style={{ fontSize: 14 }}>
              E-mail corporativo
              <input className="input" type="email" autoComplete="username" placeholder="nome@empresa.com.br"
                value={email} onChange={(e) => setEmail(e.target.value)} style={{ minHeight: 54, borderRadius: 16 }} />
            </label>
            <div className="stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <label htmlFor="senha" style={{ fontSize: 14, fontWeight: 500 }}>Senha</label>
                <a href="#" style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Esqueci minha senha</a>
              </div>
              <div className="pw-field">
                <input id="senha" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                  <Icon name={show ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 300, color: '#3A4366' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#1F45FF' }} />
              Manter conectado neste dispositivo
            </label>
            {error && <span className="form-error" role="alert">{error}</span>}
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? <span className="spinner" /> : <>Entrar <Icon name="arrowRight" /></>}
            </button>
            <div className="divider">ou</div>
            <button type="button" className="btn btn-outline btn-lg btn-block" onClick={sso}>
              <Icon name="lock" /> Entrar com SSO da empresa
            </button>
          </form>
          <p style={{ fontSize: 14 }}>Sem acesso? Peça ao administrador da sua equipe para liberar seu perfil.</p>
        </div>
      </main>

      <div className="capsule-panel" aria-hidden="true">
        <span style={{ left: '50%', top: '50%', width: 560, height: 340, margin: '-170px 0 0 -280px', border: '1.5px solid rgba(240,18,46,.35)', borderRadius: '50%', transform: 'rotate(-24deg)' }} />
        <span style={{ left: '50%', top: '50%', width: 220, height: 220, margin: '-230px 0 0 -40px', borderRadius: '50%', background: 'rgba(255,74,94,.28)', filter: 'blur(60px)' }} />
        <span style={{ left: '50%', top: '50%', width: 240, height: 240, margin: '-10px 0 0 -200px', borderRadius: '50%', background: 'rgba(31,69,255,.3)', filter: 'blur(60px)' }} />
        <span style={{ left: '50%', top: '50%', width: 340, height: 50, margin: '225px 0 0 -170px', borderRadius: '50%', background: 'rgba(20,30,100,.28)', filter: 'blur(22px)' }} />
        <span style={{ left: '50%', top: '50%', width: 190, height: 470, margin: '-250px 0 0 -95px', transform: 'rotate(38deg)' }}>
          <span style={{ left: 0, top: 0, width: 190, height: 250, borderRadius: '95px 95px 6px 6px', background: 'linear-gradient(90deg, #6E0412 0%, #B9061F 12%, #EE1430 30%, #FF6B7B 42%, #FF9AA5 47%, #F0122E 60%, #C8081F 80%, #7A0515 100%)', boxShadow: 'inset 0 18px 30px rgba(255,255,255,.18)' }} />
          <span style={{ left: 0, top: 0, width: 190, height: 250, borderRadius: '95px 95px 6px 6px', background: 'radial-gradient(ellipse 70% 38% at 42% 16%, rgba(255,255,255,.45), rgba(255,255,255,0) 70%)' }} />
          <span style={{ left: -5, top: 226, width: 200, height: 250, borderRadius: '8px 8px 100px 100px', background: 'linear-gradient(90deg, #08135E 0%, #1229B8 12%, #1F45FF 30%, #6F8BFF 42%, #A7B8FF 47%, #2A4FFF 60%, #1533D6 80%, #0A1670 100%)', boxShadow: '0 -4px 8px rgba(10,16,60,.35)' }} />
          <span style={{ left: -5, top: 226, width: 200, height: 250, borderRadius: '8px 8px 100px 100px', background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(5,10,50,.45), rgba(5,10,50,0) 70%)' }} />
          <span style={{ left: -5, top: 226, width: 200, height: 6, borderRadius: 6, background: 'linear-gradient(90deg, rgba(255,255,255,.1), rgba(255,255,255,.6) 45%, rgba(255,255,255,.1))' }} />
          <span style={{ left: 50, top: 34, width: 20, height: 170, borderRadius: 10, background: 'linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.35))', filter: 'blur(1.5px)' }} />
          <span style={{ left: 48, top: 250, width: 18, height: 160, borderRadius: 9, background: 'linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.1))', filter: 'blur(1.5px)' }} />
        </span>
        <span style={{ top: '18%', right: '20%', color: '#141C46' }}><Icon name="sparkle" size={30} /></span>
        <span style={{ bottom: '22%', left: '18%', color: '#4F6EF7' }}><Icon name="sparkle" size={18} /></span>
      </div>
    </div>
  );
}
