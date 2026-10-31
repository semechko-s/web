# React frontend для ValeraApi

Интерфейс React + Vite: регистрация и вход, список своих Валер, администраторский общий список, поиск, создание персонажей, статистика и игровые действия.

## Запуск

Требуются Node.js 20.19+ или 22.12+ и .NET 10 SDK.

### Backend

Из каталога проекта:

```powershell
cd ValeraApi
dotnet restore
dotnet run --launch-profile http
```

API: `http://localhost:5055`, Swagger: `http://localhost:5055/swagger`.

### Frontend

Во втором терминале:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Откройте `http://localhost:5173`.

В `.env` задан `VITE_API_URL=http://localhost:5055/api/valera`. Из него интерфейс автоматически формирует адрес `/api/auth`.

## Возможности

- Регистрация и вход по email/паролю.
- JWT хранится в localStorage и автоматически передаётся API-клиентом.
- User видит только свои записи через `GET /api/valera/my`.
- Admin видит все записи через `GET /api/valera`.
- Создание Валеры; владелец назначается сервером из JWT.
- Открытие карточки `/valera/:id`, просмотр параметров и выполнение семи действий.
- Backend проверяет владельца при чтении, изменении, удалении и каждом игровом действии.
- Администратор может работать с любыми записями.

## Маршруты игровых действий

`POST /api/valera/{id}/work`, `/nature`, `/drink-series`, `/bar`, `/drink-marginal`, `/metro`, `/sleep`.

Решение о допустимости действия принимает backend-модель; frontend только отображает подсказки и блокирует очевидно недоступные действия.
