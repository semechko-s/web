import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, Trees, Tv, Beer, Users, Mic2, Moon, HeartPulse, Wine, Smile, Battery, Coins, RefreshCw, LoaderCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { valeraApi } from '../api/valeraApi';

const actions = [
  { key: 'work', title: 'Пойти на работу', description: 'Заработать 100 ₽', icon: BriefcaseBusiness, tone: 'green' },
  { key: 'nature', title: 'Созерцать природу', description: 'Немного душевного покоя', icon: Trees, tone: 'green' },
  { key: 'drink-series', title: 'Пить вино и смотреть сериал', description: 'Удовольствие за 20 ₽', icon: Tv, tone: 'purple' },
  { key: 'bar', title: 'Сходить в бар', description: 'Вечер за 100 ₽', icon: Beer, tone: 'orange' },
  { key: 'drink-marginal', title: 'Выпить с маргинальными личностями', description: 'Рискованное приключение · 150 ₽', icon: Users, tone: 'red' },
  { key: 'metro', title: 'Петь в метро', description: 'Микрофон не нужен', icon: Mic2, tone: 'blue' },
  { key: 'sleep', title: 'Спать', description: 'Восстановить силы', icon: Moon, tone: 'blue' },
];

function Metric({ label, value, max = 100, icon: Icon, kind = 'normal', suffix = '' }) {
  const numeric = Number(value ?? 0);
  const percent = kind === 'mood' ? ((numeric + 10) / 20) * 100 : Math.max(0, Math.min(100, (numeric / max) * 100));
  const color = kind === 'mood' ? (numeric < 0 ? 'red' : 'green') : kind === 'alcohol' ? (numeric >= 70 ? 'red' : numeric >= 40 ? 'orange' : 'purple') : kind === 'fatigue' ? (numeric >= 70 ? 'red' : numeric >= 40 ? 'orange' : 'green') : numeric <= 20 ? 'red' : numeric <= 50 ? 'orange' : 'green';
  return <div className="metric"><div className={`metric-icon ${color}`}><Icon size={18}/></div><div className="metric-main"><div className="metric-label"><span>{label}</span><strong>{numeric.toLocaleString('ru-RU')}{suffix}</strong></div><div className="progress-track"><div className={`progress-fill ${color}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}/></div></div></div>;
}

export default function ValeraStats() {
  const { id } = useParams();
  const [valera, setValera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try { setValera(await valeraApi.getById(id)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  async function perform(action) {
    setActing(action.key); setError(''); setNotice('');
    try {
      await valeraApi.act(id, action.key);
      await load(false);
      setNotice(`Действие «${action.title}» выполнено.`);
    } catch (e) { setError(e.message); await load(false); }
    finally { setActing(''); }
  }
  if (loading && !valera) return <main className="page-shell"><div className="loading-state tall"><LoaderCircle className="spin" size={28}/><span>Загружаем статистику...</span></div></main>;
  if (!valera) return <main className="page-shell"><Link to="/" className="back-link"><ArrowLeft size={17}/> К списку Валер</Link><div className="error-panel"><div><strong>Не удалось открыть персонажа</strong><p>{error || 'Валера не найдена.'}</p></div><button className="button secondary" onClick={() => load()}><RefreshCw size={16}/> Повторить</button></div></main>;
  const workBlocked = valera.fatigue >= 10 || valera.alcohol >= 50;
  const restrictions = {
    work: workBlocked ? `Работа недоступна: ${valera.fatigue >= 10 ? 'усталость должна быть меньше 10' : 'алкоголь должен быть меньше 50'}.` : '',
    'drink-series': valera.money < 20 ? 'Не хватает денег: нужно 20 ₽.' : '',
    bar: valera.money < 100 ? 'Не хватает денег: нужно 100 ₽.' : '',
    'drink-marginal': valera.money < 150 ? 'Не хватает денег: нужно 150 ₽.' : '',
  };
  return <main className="page-shell">
    <header className="topbar"><Link to="/" className="brand"><span className="brand-mark">В.</span><span>VALERA<span className="brand-sub">PERSONAL MANAGEMENT</span></span></Link><span className="topbar-note"><span className="status-dot"/> НАБЛЮДЕНИЕ АКТИВНО</span></header>
    <Link to="/" className="back-link"><ArrowLeft size={17}/> Все Валеры</Link>
    <section className="stats-hero"><div className="stats-avatar">{(valera.name || 'В').trim().charAt(0).toLocaleUpperCase('ru')}</div><div className="stats-identity"><span className="eyebrow">ЛИЧНОЕ ДЕЛО / ID {String(valera.id).padStart(3, '0')}</span><h1>{valera.name || `Валера #${valera.id}`}<span className="title-dot">.</span></h1><p>Текущее состояние персонажа и доступные действия.</p></div><button className="button secondary refresh-button" onClick={() => load()} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''}/> Обновить</button></section>
    {error && <div className="notice error-notice"><AlertTriangle size={18}/><span>{error}</span></div>}{notice && <div className="notice success-notice"><CheckCircle2 size={18}/><span>{notice}</span></div>}
    <div className="stats-layout"><section className="panel stats-panel"><div className="section-heading"><div><span className="eyebrow">СВОДКА</span><h2>Состояние Валеры</h2></div><span className="live-pill"><span className="status-dot"/> LIVE</span></div>
      <div className="metrics-grid"><Metric label="Здоровье" value={valera.health} icon={HeartPulse}/><Metric label="Алкоголь" value={valera.alcohol} icon={Wine} kind="alcohol"/><Metric label="Жизнерадостность" value={valera.cheerfulness} icon={Smile} kind="mood"/><Metric label="Усталость" value={valera.fatigue} icon={Battery} kind="fatigue"/><Metric label="Деньги" value={valera.money} max={1000} icon={Coins} suffix=" ₽"/></div>
      <div className="rule-note"><AlertTriangle size={17}/><span>{workBlocked ? 'Работа недоступна: Валера слишком устала или находится в состоянии опьянения.' : 'Валера может отправиться на работу. Не забывайте следить за усталостью.'}</span></div>
    </section>
    <section className="panel actions-panel"><div className="section-heading"><div><span className="eyebrow">ВЛИЯЙТЕ НА СОСТОЯНИЕ</span><h2>Что будем делать?</h2></div></div><div className="actions-list">{actions.map(action => {
      const Icon = action.icon; const disabled = Boolean(acting) || Boolean(restrictions[action.key]);
      return <button key={action.key} className={`action-button ${disabled ? 'is-disabled' : ''}`} onClick={() => perform(action)} disabled={disabled} title={restrictions[action.key] || action.title}>
        <span className={`action-icon ${action.tone}`}>{acting === action.key ? <LoaderCircle className="spin" size={19}/> : <Icon size={19}/>}</span><span className="action-copy"><strong>{action.title}</strong><small>{restrictions[action.key] || action.description}</small></span><span className="action-end">{acting === action.key ? '...' : <ArrowLeft className="action-arrow" size={17}/>}</span>
      </button>;
    })}</div></section></div>
    <footer className="page-footer"><span>VALERA MANAGEMENT SYSTEM</span><span>ВСЕ ДЕЙСТВИЯ СОХРАНЯЮТСЯ В БАЗЕ ДАННЫХ</span></footer>
  </main>;
}
