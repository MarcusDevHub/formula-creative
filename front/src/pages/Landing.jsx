import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import logo from '../assets/logo.png';
import heroImg from '../assets/landing-hero.png';
import ideiasImg from '../assets/card-ideias.png';
import tempoImg from '../assets/card-tempo.png';
import '../styles/landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-inner">
        <header className="landing-header">
          <Link to="/" aria-label="Formula, página inicial">
            <img src={logo} alt="Formula, a dose certa de criatividade" />
          </Link>
          <nav className="landing-nav" aria-label="Seções">
            <a href="#o-que-ela-faz" aria-current="page">O que ela faz</a>
          </nav>
          <Link to="/login" className="btn btn-primary">
            Login <Icon name="arrowRight" />
          </Link>
        </header>

        <section className="hero">
          <div className="hero-text">
            <span className="pill-tag">
              <span className="red-dot" />IA CRIATIVA<span className="sep" aria-hidden="true" />VAREJO FARMACÊUTICO
            </span>
            <h1>
              Ideias que viram<br />
              <span className="gradient-text">grandes campanhas.</span>
            </h1>
            <p>A Fórmula é a IA que entende o seu briefing, traz insights, gera ideias e te ajuda a criar com mais agilidade e impacto.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/app" className="btn btn-primary btn-lg">
                Explorar Protótipo (Demo) <Icon name="arrowRight" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Área de Login
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <img src={heroImg} alt="Tela da Formula transformando um briefing em campanha, com atalhos para campanhas, posts, vídeos, slogans e materiais de PDV" />
          </div>
        </section>

        <section id="o-que-ela-faz" className="feature-grid" aria-label="O que a Formula faz">
          <Link to="/login" className="feature feature-red">
            <img src={ideiasImg} alt="" />
            <span className="feature-body">
              <span className="feature-icon" aria-hidden="true"><Icon name="brain" size={38} strokeWidth={1.7} /></span>
              <h2>Destrava<br />ideias</h2>
              <p>Novos caminhos,<br />novos conceitos.</p>
              <span className="feature-arrow" aria-hidden="true"><Icon name="arrowRight" size={18} strokeWidth={2.2} /></span>
            </span>
          </Link>

          <Link to="/login" className="feature feature-blue">
            <span className="gov-art" aria-hidden="true">
              <span className="gov-card back">
                <span className="top"><span style={{ width: '85%' }} /><span style={{ width: '60%' }} /></span>
                <span className="bottom">
                  <span className="gov-tag" style={{ color: '#A50E25', background: '#FDE3E7' }}>promessa além da bula</span>
                </span>
              </span>
              <span className="gov-seal no"><Icon name="x" size={20} strokeWidth={3} /></span>
              <span className="gov-card front">
                <span className="top"><span style={{ width: '80%' }} /><span style={{ width: '50%' }} /></span>
                <span className="bottom">
                  <span className="gov-tag" style={{ color: '#0B6B3A', background: '#DDF3E6' }}>aprovada</span>
                  <span>7 de 7 regras ok</span>
                </span>
              </span>
              <span className="gov-seal yes"><Icon name="check" size={22} strokeWidth={3} /></span>
            </span>
            <span className="feature-body">
              <span className="feature-icon" aria-hidden="true"><Icon name="shield" size={38} /></span>
              <h2>Aprove com<br />segurança</h2>
              <p>Cada peça checada<br />antes de ir ao ar.</p>
              <span className="feature-arrow" aria-hidden="true"><Icon name="arrowRight" size={18} strokeWidth={2.2} /></span>
            </span>
          </Link>

          <Link to="/login" className="feature feature-violet">
            <img src={tempoImg} alt="" />
            <span className="feature-body">
              <span className="feature-icon" aria-hidden="true"><Icon name="clock" size={38} /></span>
              <h2>Ganhe<br />tempo</h2>
              <p>Mais agilidade<br />para o que importa.</p>
              <span className="feature-arrow" aria-hidden="true"><Icon name="arrowRight" size={18} strokeWidth={2.2} /></span>
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
