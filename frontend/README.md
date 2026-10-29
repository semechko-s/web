# React frontend для ValeraApi

Интерфейс на React + Vite: список Валер, поиск, создание персонажа, карточка статистики и действия с обновлением состояния через API.

## Запуск

Требуются Node.js 20.19+ или 22.12+ и .NET 10 SDK.

### 1. Запустить backend

В первом терминале из каталога `web`:

```bash
cd ValeraApi
dotnet restore
dotnet run --launch-profile http
```

API будет доступен по адресу `http://localhost:5055`, Swagger — `http://localhost:5055/swagger`.

### 2. Запустить React

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Открыть `http://localhost:5173`.

Если backend запущен на другом адресе/порту, скопируйте `.env.example` в `.env` и укажите `VITE_API_URL`, например `VITE_API_URL=https://localhost:7072/api/valera`. После изменения `.env` перезапустите Vite.

## Реализовано

- `GET /api/valera` и поиск по имени без дополнительного запроса к серверу.
- Создание персонажа через `POST /api/valera` с вводом имени и начальных параметров.
- Переход на `/valera/:id`.
- Индикаторы здоровья, алкоголя, жизнерадостности, усталости и денег.
- Все семь действий из backend: `work`, `nature`, `drink-series`, `bar`, `drink-marginal`, `metro`, `sleep`.
- После действия перечитывается `GET /api/valera/{id}`; показываются ошибки и результат.
- Кнопка работы блокируется при усталости >= 10 или алкоголе >= 50. Денежные действия блокируются при недостатке средств.
- CORS для Vite включён в `ValeraApi/Program.cs`.

## Примечания

`ValeraController` уже содержит нужные маршруты, поэтому добавлять новые backend endpoints для этого задания не требуется. Валидация в интерфейсе улучшает UX, а окончательное решение о возможности действия остаётся за backend-моделью.
