# Valera — ASP.NET Core + EF Core + SQLite + React

## Состав

- `ValeraApi/` — ASP.NET Core Web API, JWT-аутентификация, роли User/Admin, EF Core и SQLite.
- `frontend/` — React + Vite.
- `ValeraApi.Tests/` — unit-тесты доменной модели.

## Требования

- .NET SDK 10
- Node.js 20+ и npm

## Запуск backend (Windows PowerShell)

```powershell
cd ValeraApi
dotnet restore
dotnet run --launch-profile http
```

API: `http://localhost:5055`  
Swagger: `http://localhost:5055/swagger`

При старте backend автоматически применяет EF Core migrations. Файл SQLite `valera.db` расположен в каталоге `ValeraApi`.

## Запуск frontend (второй терминал)

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

`frontend/.env.example` уже содержит адрес API:
`VITE_API_URL=http://localhost:5055/api/valera`

## Регистрация и вход

1. Откройте `http://localhost:5173/register`.
2. Зарегистрируйте пользователя.
3. Войдите через `/login`.
4. Создавайте Валер — они автоматически закрепляются за текущим пользователем.

Публичная регистрация всегда создаёт роль `User`. Клиент не может назначить себе `Admin`.

## Назначение администратора

После регистрации пользователя измените его роль в SQLite:

```sql
UPDATE Users
SET Role = 'Admin'
WHERE Email = 'admin@example.com';
```

Затем выйдите из приложения и войдите снова: роль записывается в JWT при входе.

Для открытия SQLite можно использовать DB Browser for SQLite. Путь к БД: `ValeraApi/valera.db`.

## Авторизация и права

- Все маршруты `/api/valera` требуют JWT.
- `GET /api/valera` — только Admin.
- `GET /api/valera/my` — Валеры текущего пользователя.
- Чтение одной записи, изменение, удаление и игровые действия разрешены владельцу или Admin.
- `UserId` при создании берётся из JWT, а не из тела запроса.
- Для изменения владелец из исходной записи сохраняется сервером.

## Проверка

```powershell
cd ValeraApi
dotnet build
dotnet test
```

В другом терминале:

```powershell
cd frontend
npm run build
```

## JWT secret

В `appsettings.json` задан ключ только для локальной разработки. Для собственного окружения задайте переменную `Jwt__Key` (не менее 32 байт), например:

```powershell
$env:Jwt__Key = "replace-this-with-a-long-random-secret-value"
```

Не используйте ключ из репозитория в production.

## Существующая база данных

В архив включена база `ValeraApi/valera.db` из переданного проекта, чтобы сохранить находившиеся в ней записи и пользователей. Перед экспериментами сделайте копию файла. Для чистой установки удалите `valera.db`: при следующем запуске миграции создадут новую базу.
