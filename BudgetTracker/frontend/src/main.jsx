import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const api = import.meta.env.VITE_API_URL || 'http://localhost:5065/api'
const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const formatMoney = kopecks => money.format(kopecks / 100)
const today = () => {
  const date = new Date()
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(value => String(value).padStart(2, '0')).join('-')
}
const categories = {
  income: ['Зарплата', 'Подработка', 'Подарки', 'Прочее'],
  expense: ['Продукты', 'Транспорт', 'Жильё', 'Здоровье', 'Развлечения', 'Прочее'],
}

async function request(path, { token, body, method = 'GET', signal } = {}) {
  const response = await fetch(api + path, {
    method, signal,
    headers: {
      ...(token && { Authorization: 'Bearer ' + token }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || Object.values(data?.errors || {}).flat().join(' ')
    throw Object.assign(new Error(message || 'Запрос не выполнен (' + response.status + ').'), {
      status: response.status,
    })
  }
  return data
}

function Auth({ onLogin, expired }) {
  const [register, setRegister] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget))
    setError('')
    setBusy(true)
    try {
      const { email, password } = body
      if (register) await request('/auth/register', { method: 'POST', body })
      onLogin(await request('/auth/login', { method: 'POST', body: { email, password } }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth">
    <span className="brand">Мой бюджет</span>
    <h1>{register ? 'Создать аккаунт' : 'Войти в аккаунт'}</h1>
    <p>Учитывайте доходы и расходы и следите за итогами месяца.</p>
    {expired && <p role="status">Сеанс завершился. Войдите снова.</p>}
    <form onSubmit={submit}>
      {register && <label>Имя<input name="username" required minLength="2" maxLength="80" autoComplete="name" /></label>}
      <label>Электронная почта<input name="email" type="email" required maxLength="254" autoComplete="email" /></label>
      <label>Пароль<input name="password" type="password" required minLength={register ? 8 : undefined}
        maxLength="128" autoComplete={register ? 'new-password' : 'current-password'} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={busy}>{register ? 'Зарегистрироваться' : 'Войти'}</button>
    </form>
    <button type="button" className="secondary" disabled={busy} onClick={() => {
      setRegister(!register)
      setError('')
    }}>{register ? 'Уже есть аккаунт' : 'Создать аккаунт'}</button>
  </main>
}

function OperationForm({ item, month, onSave, onClose, busy }) {
  const [type, setType] = useState(item?.isIncome ? 'income' : 'expense')
  const [category, setCategory] = useState(item?.category ?? categories.expense[0])
  const options = [...new Set([...categories[type], category])]

  function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const [rubles, fractional = ''] = fields.get('amount').replace(',', '.').split('.')
    onSave({
      isIncome: type === 'income',
      amountKopecks: Number(rubles) * 100 + Number(fractional.padEnd(2, '0')),
      date: fields.get('date'),
      category,
      note: fields.get('note'),
    })
  }

  return <form className="panel operation" onSubmit={submit}>
    <h2>{item ? 'Редактировать операцию' : 'Новая операция'}</h2>
    <div className="fields">
      <label>Тип<select value={type} onChange={event => {
        const next = event.target.value
        setType(next)
        setCategory(categories[next][0])
      }}><option value="expense">Расход</option><option value="income">Доход</option></select></label>
      <label>Сумма, ₽<input name="amount" required inputMode="decimal"
        pattern="[0-9]{1,10}([.,][0-9]{1,2})?" title="Введите сумму с точностью до двух знаков"
        defaultValue={item ? (item.amountKopecks / 100).toFixed(2) : ''} /></label>
      <label>Категория<select value={category} onChange={event => setCategory(event.target.value)}>
        {options.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>Дата<input type="date" name="date" required min="1900-01-01" max="2100-12-31"
        defaultValue={item?.date || (today().startsWith(month) ? today() : month + '-01')} /></label>
    </div>
    <label>Комментарий<input name="note" maxLength="200" defaultValue={item?.note} /></label>
    <div className="actions"><button disabled={busy}>Сохранить</button>
      <button className="secondary" type="button" onClick={onClose} disabled={busy}>Отмена</button></div>
  </form>
}

function Dashboard({ session, onLogout }) {
  const [month, setMonth] = useState(today().slice(0, 7))
  const [items, setItems] = useState([])
  const [loadedMonth, setLoadedMonth] = useState(null)
  const [filter, setFilter] = useState('all')
  const [editor, setEditor] = useState(null)
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoadError('')
    request('/transactions?month=' + month, { token: session.token, signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return
        setItems(data)
        setLoadedMonth(month)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        if (err.status === 401) onLogout(true)
        else setLoadError(err.message)
      })
    return () => controller.abort()
  }, [month, revision, session.token, onLogout])

  async function mutate(path, method, body) {
    setBusy(true)
    setError('')
    try {
      await request('/transactions' + path, { token: session.token, method, body })
      setEditor(null)
      setLoadedMonth(null)
      if (body) setMonth(body.date.slice(0, 7))
      setRevision(value => value + 1)
    } catch (err) {
      if (err.status === 401) onLogout(true)
      else setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const monthItems = loadedMonth === month ? items : []
  let income = 0
  let expenses = 0
  const spending = new Map()
  for (const item of monthItems) {
    if (item.isIncome) income += item.amountKopecks
    else {
      expenses += item.amountKopecks
      spending.set(item.category, (spending.get(item.category) || 0) + item.amountKopecks)
    }
  }
  const shown = monthItems.filter(item => filter === 'all' || item.isIncome === (filter === 'income'))
  const ready = loadedMonth === month && !loadError

  return <>
    <header><div className="top"><span className="brand">Мой бюджет</span>
      <div className="actions"><span>{session.user.username}</span>
        <button className="secondary" onClick={() => onLogout()}>Выйти</button></div></div></header>
    <main className="dashboard">
      <div className="heading"><h1>Обзор бюджета</h1><button onClick={() => {
        setError('')
        setEditor({})
      }} disabled={busy}>+ Добавить операцию</button></div>
      <label className="month">Отчётный месяц<input type="month" value={month}
        min="1900-01" max="2100-12" disabled={busy} onChange={event => {
          const value = event.target.value
          if (!/^(19[0-9]{2}|20[0-9]{2}|2100)-(0[1-9]|1[0-2])$/.test(value)) return
          setMonth(value)
          setLoadedMonth(null)
          setEditor(null)
          setError('')
        }} /></label>
      <div className="summary">
        <div className="panel balance"><span>Итог за месяц</span><strong>{ready ? formatMoney(income - expenses) : '—'}</strong></div>
        <div className="panel"><span>Доходы</span><strong className="income">{ready ? formatMoney(income) : '—'}</strong></div>
        <div className="panel"><span>Расходы</span><strong>{ready ? formatMoney(expenses) : '—'}</strong></div>
      </div>
      {editor && <OperationForm key={editor.id ?? 'new'} item={editor.id ? editor : null}
        month={month} busy={busy} onClose={() => { setEditor(null); setError('') }}
        onSave={body => mutate(editor.id ? '/' + editor.id : '', editor.id ? 'PUT' : 'POST', body)} />}
      {error && <p className="error" role="alert">{error}</p>}
      {loadError && <p className="error" role="alert">{loadError}{' '}
        <button className="secondary" onClick={() => setRevision(value => value + 1)}>Повторить</button></p>}
      <div className="details">
        <section className="panel">
          <div className="heading"><h2>Операции</h2>
            <select aria-label="Фильтр операций" value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="all">Все</option><option value="income">Доходы</option><option value="expense">Расходы</option>
            </select></div>
          {!loadError && !ready && <p role="status">Загрузка операций…</p>}
          {ready && !shown.length && <p>За выбранный месяц операций по этому фильтру нет.</p>}
          {ready && shown.length > 0 && <ul className="transactions">{shown.map(item => <li key={item.id}>
            <div><b>{item.category}</b><small>{item.date.split('-').reverse().join('.')}{item.note && ' · ' + item.note}</small></div>
            <b className={item.isIncome ? 'income' : ''}>{item.isIncome ? '+' : '−'}{formatMoney(item.amountKopecks)}</b>
            <div className="actions">
              <button className="secondary" disabled={busy} onClick={() => {
                setError('')
                setEditor(item)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}>Изменить</button>
              <button className="secondary danger" disabled={busy} onClick={() => {
                if (window.confirm('Удалить операцию «' + item.category + '»?')) mutate('/' + item.id, 'DELETE')
              }}>Удалить</button>
            </div>
          </li>)}</ul>}
        </section>
        <section className="panel"><h2>Расходы по категориям</h2>
          {ready && spending.size === 0 && <p>В этом месяце расходов пока нет.</p>}
          {ready && [...spending].sort((a, b) => b[1] - a[1]).map(([name, amount]) =>
            <div className="category" key={name}>
              <div><span>{name}</span><b>{formatMoney(amount)}</b></div>
              <progress aria-label={name} value={amount} max={expenses} />
            </div>
          )}
        </section>
      </div>
    </main>
  </>
}

function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('budget-session')) } catch { return null }
  })
  const [expired, setExpired] = useState(false)
  const logout = React.useCallback((timedOut = false) => {
    sessionStorage.removeItem('budget-session')
    setExpired(timedOut)
    setSession(null)
  }, [])

  return session
    ? <Dashboard session={session} onLogout={logout} />
    : <Auth expired={expired} onLogin={value => {
      sessionStorage.setItem('budget-session', JSON.stringify(value))
      setSession(value)
    }} />
}

createRoot(document.getElementById('root')).render(<App />)
