const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5055/api/valera').replace(/\/$/, '');

async function request(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Не удалось подключиться к API. Проверьте, запущен ли backend.');
  }
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = typeof body === 'string' ? body : body.title || body.message || body.detail || '';
    } catch { /* Ответ может быть пустым */ }
    throw new Error(detail || `Ошибка API: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204 || response.status === 205) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const valeraApi = {
  getAll: () => request(),
  getById: (id) => request(`/${id}`),
  create: (data) => request('', { method: 'POST', body: JSON.stringify(data) }),
  act: (id, action) => request(`/${id}/${action}`, { method: 'POST' }),
};
