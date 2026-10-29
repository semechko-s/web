import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Search, Users, Heart, Wine, Coins, X, LoaderCircle, RefreshCw } from 'lucide-react';
import { valeraApi } from '../api/valeraApi';

const initialForm = { name: '', health: 100, alcohol: 0, cheerfulness: 0, fatigue: 0, money: 500 };

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Укажите имя персонажа.'); return; }
    setSaving(true);
    try {
      await valeraApi.create({
        name: form.name.trim(), health: Number(form.health), alcohol: Number(form.alcohol),
        cheerfulness: Number(form.cheerfulness), fatigue: Number(form.fatigue), money: Number(form.money),
      });
      await onCreated();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  const fields = [
    ['health', 'Здоровье', 0, 100], ['alcohol', 'Алкоголь', 0, 100],
    ['cheerfulness', 'Жизнерадостность', -10, 10], ['fatigue', 'Усталость', 0, 100], ['money', 'Деньги', 0, 100000],
  ];
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-heading"><div><span className="eyebrow">НОВАЯ ИСТОРИЯ</span><h2>Создать Валеру</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={20}/></button></div>
      <label className="field full-field">Имя персонажа<input name="name" value={form.name} onChange={change} placeholder="Например, Валера" maxLength={80} autoFocus required /></label>
      <div className="form-grid">{fields.map(([key, label, min, max]) => <label className="field" key={key}>{label}<input type="number" name={key} value={form[key]} onChange={change} min={min} max={max} step={key === 'money' ? '0.01' : '1'} required /></label>)}</div>
      {error && <p className="error-message">{error}</p>}
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button className="button primary" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={17}/> Создаём...</> : <><Plus size={17}/> Создать Валеру</>}</button></div>
    </form>
  </div>;
}

export default function ValeraList() {
  const [valeras, setValeras] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setError(''); setLoading(true);
    try { const data = await valeraApi.getAll(); setValeras(Array.isArray(data) ? data : []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => valeras.filter(v => (v.name || '').toLocaleLowerCase('ru').includes(search.toLocaleLowerCase('ru'))), [valeras, search]);

  return <main className="page-shell">
    <header className="topbar"><Link to="/" className="brand"><span className="brand-mark">В.</span><span>VALERA<span className="brand-sub">PERSONAL MANAGEMENT</span></span></Link><span className="topbar-note"><span className="status-dot"/> СИСТЕМА УПРАВЛЕНИЯ</span></header>
    <section className="hero"><div><span className="eyebrow">ЦЕНТР УПРАВЛЕНИЯ</span><h1>Все Валеры<span className="title-dot">.</span></h1><p>Следите за состоянием, принимайте решения и наблюдайте за последствиями.</p></div><div className="hero-stamp"><Users size={19}/><strong>{valeras.length.toString().padStart(2, '0')}</strong><span>ПЕРСОНАЖЕЙ</span></div></section>
    <section className="toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Найти Валеру по имени..." aria-label="Поиск по имени"/>{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Очистить поиск"><X size={15}/></button>}</div><button className="button primary" onClick={() => setShowModal(true)}><Plus size={18}/> Создать Валеру</button></section>
    {error && <div className="error-panel"><div><strong>Не удалось загрузить список</strong><p>{error}</p></div><button className="button secondary" onClick={load}><RefreshCw size={16}/> Повторить</button></div>}
    {loading ? <div className="loading-state"><LoaderCircle className="spin" size={28}/><span>Загружаем персонажей...</span></div> : !error && filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"><Users size={27}/></div><h2>{search ? 'Никого не нашли' : 'Пока здесь пусто'}</h2><p>{search ? 'Попробуйте изменить поисковый запрос.' : 'Создайте первого Валеру и начните наблюдение.'}</p>{!search && <button className="button primary" onClick={() => setShowModal(true)}><Plus size={17}/> Создать Валеру</button>}</div> : <section className="valera-grid">{filtered.map((v, index) => <Link to={`/valera/${v.id}`} className="valera-card" key={v.id} style={{ animationDelay: `${index * 45}ms` }}>
      <div className="card-top"><div className="avatar">{(v.name || 'В').trim().charAt(0).toLocaleUpperCase('ru')}</div><span className="id-label">ID / {String(v.id).padStart(3, '0')}</span><ArrowRight className="card-arrow" size={19}/></div>
      <h2>{v.name || `Валера #${v.id}`}</h2><div className="mini-stats"><div><Heart size={15}/><span>Здоровье</span><strong>{v.health ?? 0}</strong></div><div><Wine size={15}/><span>Алкоголь</span><strong>{v.alcohol ?? 0}</strong></div><div><Coins size={15}/><span>Деньги</span><strong>{Number(v.money ?? 0).toLocaleString('ru-RU')} ₽</strong></div></div>
      <div className="card-footer"><span>ОТКРЫТЬ СТАТИСТИКУ</span><ArrowRight size={15}/></div>
    </Link>)}</section>}
    <footer className="page-footer"><span>VALERA MANAGEMENT SYSTEM</span><span>СОСТОЯНИЕ МИРА: НЕСТАБИЛЬНОЕ</span></footer>
    {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={load}/>}
  </main>;
}
