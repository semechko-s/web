import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Activity, ArrowUpRight, HeartPulse, Plus, Search, RefreshCw,
    LogOut, X, Wine, Battery, Coins
} from 'lucide-react';
import { valeraApi } from '../api/valeraApi';

export default function ValeraList() {
    const [valeras, setValeras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username') || 'Пользователь';
    const isAdmin = role === 'Admin';
    const navigate = useNavigate();

    const load = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const result = isAdmin
                ? await valeraApi.getAll()
                : await valeraApi.getMine();
            setValeras(Array.isArray(result) ? result : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => { load(); }, [load]);

    async function createValera(e) {
        e.preventDefault();
        setCreateError('');
        setCreating(true);
        try {
            await valeraApi.create({
                name: name.trim() || 'Валера',
                health: 100,
                alcohol: 0,
                cheerfulness: 0,
                fatigue: 0,
                money: 0,
            });
            setName('');
            setShowCreate(false);
            await load();
        } catch (e) {
            setCreateError(e.message);
        } finally {
            setCreating(false);
        }
    }

    function logout() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login', { replace: true });
    }

    const visibleValeras = valeras.filter(v =>
        (v.name || '').toLocaleLowerCase('ru').includes(search.toLocaleLowerCase('ru')) ||
        String(v.id).includes(search)
    );

    return (
        <main className="page-shell">
            <header className="topbar">
                <Link to="/" className="brand">
                    <span className="brand-mark">В.</span>
                    <span>VALERA<span className="brand-sub">PERSONAL MANAGEMENT</span></span>
                </Link>
                <div className="topbar-note">
                    <span className="status-dot" />
                    {username} · {isAdmin ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                    <button className="icon-button" onClick={logout} title="Выйти" aria-label="Выйти">
                        <LogOut size={17} />
                    </button>
                </div>
            </header>

            <section className="hero">
                <div>
                    <span className="eyebrow">СИСТЕМА УПРАВЛЕНИЯ ПЕРСОНАЖАМИ</span>
                    <h1>{isAdmin ? 'Все Валеры' : 'Мои Валеры'}<span className="title-dot">.</span></h1>
                    <p>Следите за состоянием, принимайте решения и наблюдайте за последствиями.</p>
                </div>
                <div className="hero-stamp"><strong>{String(valeras.length).padStart(2, '0')}</strong><span>ПЕРСОНАЖЕЙ</span></div>
            </section>

            <div className="toolbar">
                <label className="search-box">
                    <Search size={17} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Найти Валеру по имени или ID..."
                    />
                    {search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Очистить поиск"><X size={15}/></button>}
                </label>
                <button className="button secondary" onClick={load} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''}/> Обновить
                </button>
                <button className="button primary" onClick={() => setShowCreate(true)}>
                    <Plus size={17}/> Создать Валеру
                </button>
            </div>

            {error && <div className="error-panel"><div><strong>Не удалось загрузить список</strong><p>{error}</p></div><button className="button secondary" onClick={load}>Повторить</button></div>}

            {loading ? (
                <div className="loading-state"><RefreshCw className="spin" size={25}/><span>Загружаем Валер...</span></div>
            ) : visibleValeras.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><Activity size={25}/></div>
                    <h2>{search ? 'Ничего не найдено' : 'Пока здесь пусто'}</h2>
                    <p>{search ? 'Попробуйте изменить поисковый запрос.' : 'Создайте первую Валеру, чтобы начать наблюдение.'}</p>
                    {!search && <button className="button primary" onClick={() => setShowCreate(true)}><Plus size={16}/> Создать Валеру</button>}
                </div>
            ) : (
                <section className="valera-grid">
                    {visibleValeras.map(valera => (
                        <Link className="valera-card" to={`/valera/${valera.id}`} key={valera.id}>
                            <div className="card-top">
                                <div className="avatar">{(valera.name || 'В').trim().charAt(0).toLocaleUpperCase('ru')}</div>
                                <span className="id-label">ID / {String(valera.id).padStart(3, '0')}</span>
                                <ArrowUpRight className="card-arrow" size={18}/>
                            </div>
                            <h2>{valera.name || `Валера #${valera.id}`}</h2>
                            <div className="mini-stats">
                                <div><HeartPulse size={15}/><span>Здоровье</span><strong>{valera.health}</strong></div>
                                <div><Wine size={15}/><span>Алкоголь</span><strong>{valera.alcohol}</strong></div>
                                <div><Battery size={15}/><span>Усталость</span><strong>{valera.fatigue}</strong></div>
                                <div><Coins size={15}/><span>Деньги</span><strong>{Number(valera.money || 0).toLocaleString('ru-RU')} ₽</strong></div>
                            </div>
                            <div className="card-footer"><span>ОТКРЫТЬ ЛИЧНОЕ ДЕЛО</span><ArrowUpRight size={15}/></div>
                        </Link>
                    ))}
                </section>
            )}

            <footer className="page-footer">
                <span>VALERA MANAGEMENT SYSTEM</span>
                <span>ДОСТУП: {isAdmin ? 'ВСЕ ЗАПИСИ' : 'ТОЛЬКО СОБСТВЕННЫЕ ЗАПИСИ'}</span>
            </footer>

            {showCreate && (
                <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
                    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
                        <div className="modal-heading">
                            <div><span className="eyebrow">НОВАЯ ЗАПИСЬ</span><h2 id="create-title">Создать Валеру</h2></div>
                            <button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Закрыть"><X size={19}/></button>
                        </div>
                        <form onSubmit={createValera}>
                            <label className="field full-field">Имя Валеры
                                <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Например, Валера" autoFocus />
                            </label>
                            <p className="eyebrow">НАЧАЛЬНЫЕ ХАРАКТЕРИСТИКИ: ЗДОРОВЬЕ 100 · ОСТАЛЬНОЕ 0</p>
                            {createError && <p className="error-message">{createError}</p>}
                            <div className="modal-actions">
                                <button type="button" className="button secondary" onClick={() => setShowCreate(false)}>Отмена</button>
                                <button type="submit" className="button primary" disabled={creating}>{creating ? 'Создаём...' : 'Создать'}</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
