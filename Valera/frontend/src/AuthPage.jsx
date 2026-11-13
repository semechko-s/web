import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AUTH_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5055/api/valera')
    .replace(/\/valera\/?$/, '/auth');

export default function AuthPage({ mode }) {
  const register = mode === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');

        try {
            const response = await fetch(
                `${AUTH_URL}/${register ? 'register' : 'login'}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(
                        register
                            ? { email, password, username }
                            : { email, password }
                    )
                }
            );

            const responseText = await response.text();

            let data = {};

            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch {
                console.error('Сервер вернул не JSON:', responseText);
                throw new Error(
                    `Сервер вернул некорректный ответ (HTTP ${response.status}). Проверь адрес API и консоль backend.`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || data.title || `Ошибка HTTP ${response.status}`
                );
            }

            if (!register) {
                localStorage.setItem('jwt', data.token);
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('username', data.user.username);

                navigate('/', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }

        } catch (err) {
            console.error('Ошибка авторизации:', err);
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }
  return <main className="page-shell"><section className="modal" style={{maxWidth: 460, margin: '8vh auto'}}>
    <span className="eyebrow">VALERA / ACCOUNT</span><h1>{register ? 'Регистрация' : 'Вход'}</h1>
    <form onSubmit={submit}>
      {register && <label className="field full-field">Имя пользователя<input value={username} onChange={e=>setUsername(e.target.value)} minLength="2" maxLength="80" required /></label>}
      <label className="field full-field">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label className="field full-field">Пароль<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="8" required /></label>
      {error && <p className="error-message">{error}</p>}
      <button className="button primary" disabled={busy}>{busy ? 'Подождите…' : register ? 'Создать аккаунт' : 'Войти'}</button>
    </form>
    <p>{register ? 'Уже зарегистрированы? ' : 'Нет аккаунта? '}<Link to={register ? '/login' : '/register'}>{register ? 'Войти' : 'Зарегистрироваться'}</Link></p>
  </section></main>;
}
