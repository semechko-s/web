const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5055/api/valera';

async function request(endpoint = '', options = {}) {
    const token = localStorage.getItem('jwt');

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (response.status === 204) return null;

    const responseText = await response.text();
    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }
    }

    if (!response.ok) {
        const message = typeof data === 'string'
            ? data
            : data?.message || data?.title || `Ошибка HTTP ${response.status}`;
        throw new Error(message);
    }

    return data;
}

const actionRoutes = {
    work: 'work',
    nature: 'nature',
    'drink-series': 'drink-series',
    bar: 'bar',
    'drink-marginal': 'drink-marginal',
    metro: 'metro',
    sleep: 'sleep',
};

export const valeraApi = {
    getAll: () => request(),
    getMine: () => request('/my'),
    getById: (id) => request(`/${id}`),

    create: (valera) => request('', {
        method: 'POST',
        body: JSON.stringify(valera),
    }),

    update: (id, valera) => request(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(valera),
    }),

    delete: (id) => request(`/${id}`, { method: 'DELETE' }),

    act: (id, action) => {
        const route = actionRoutes[action];
        if (!route) throw new Error(`Неизвестное действие: ${action}`);
        return request(`/${id}/${route}`, { method: 'POST' });
    },
};
