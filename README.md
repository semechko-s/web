# ValeraApi — EF Core + Service + Controller + Swagger

## Запуск

```bash
cd ValeraApi
dotnet restore
dotnet run
```

Приложение использует SQLite. При первом запуске файл `valera.db` создаётся автоматически.

Swagger UI: `https://localhost:xxxx/swagger` (точный порт выводится в консоли).

## API

- `GET /api/valera` — получить всех Valera
- `GET /api/valera/{id}` — получить Valera по id
- `POST /api/valera` — создать Valera
- `PUT /api/valera/{id}` — изменить Valera
- `DELETE /api/valera/{id}` — удалить Valera
- `POST /api/valera/{id}/work` — пойти на работу
- `POST /api/valera/{id}/nature` — созерцать природу
- `POST /api/valera/{id}/drink-series` — пить и смотреть сериал
- `POST /api/valera/{id}/bar` — сходить в бар
- `POST /api/valera/{id}/drink-marginal` — выпить
- `POST /api/valera/{id}/metro` — петь в метро
- `POST /api/valera/{id}/sleep` — спать

## Пример POST

```json
{
  "health": 100,
  "alcohol": 0,
  "cheerfulness": 0,
  "fatigue": 0,
  "money": 500
}
```

## Что реализовано

1. `Microsoft.EntityFrameworkCore.Sqlite` подключает EF Core и SQLite.
2. `AppDbContext` содержит `DbSet<Valera>`.
3. `ValeraService` выполняет CRUD.
4. `ValeraController` предоставляет REST API.
5. `Swashbuckle.AspNetCore` подключает Swagger/OpenAPI и Swagger UI.
6. `EnsureCreated()` автоматически создаёт БД при первом запуске.

EF Core migrations, после установки `dotnet-ef`:

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```

После этого `EnsureCreated()` убрать.
