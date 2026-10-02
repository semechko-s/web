using Microsoft.EntityFrameworkCore;
using ValeraApi.Data;
using ValeraApi.Models;

namespace ValeraApi.Services;

public class ValeraService : IValeraService
{
    private readonly AppDbContext _db;

    public ValeraService(AppDbContext db)
    {
        _db = db;
    }

    public Task<List<Valera>> GetAllAsync() =>
        _db.Valeras.AsNoTracking().ToListAsync();

    public Task<Valera?> GetByIdAsync(int id) =>
        _db.Valeras.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);

    public async Task<Valera> CreateAsync(Valera valera)
    {
        _db.Valeras.Add(valera);
        await _db.SaveChangesAsync();
        return valera;
    }

    public async Task<bool> UpdateAsync(int id, Valera valera)
    {
        var existing = await _db.Valeras.FirstOrDefaultAsync(v => v.Id == id);
        if (existing is null)
            return false;

        existing.SetState(
            valera.Health,
            valera.Alcohol,
            valera.Cheerfulness,
            valera.Fatigue,
            valera.Money);

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var valera = await _db.Valeras.FirstOrDefaultAsync(v => v.Id == id);
        if (valera is null)
            return false;

        _db.Valeras.Remove(valera);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task<bool> ExecuteActionAsync(int id, Func<Valera, bool> action)
    {
        var valera = await _db.Valeras.FirstOrDefaultAsync(v => v.Id == id);
        if (valera is null)
            return false;

        if (!action(valera))
            return false;

        await _db.SaveChangesAsync();
        return true;
    }

    private async Task<bool> ExecuteActionAsync(int id, Action<Valera> action)
    {
        var valera = await _db.Valeras.FirstOrDefaultAsync(v => v.Id == id);
        if (valera is null)
            return false;

        action(valera);
        await _db.SaveChangesAsync();
        return true;
    }

    public Task<bool> GoToWorkAsync(int id) =>
        ExecuteActionAsync(id, v => v.GoToWork());

    public Task<bool> ContemplateNatureAsync(int id) =>
        ExecuteActionAsync(id, v => v.ContemplateNature());

    public Task<bool> DrinkWineAndWatchSeriesAsync(int id) =>
        ExecuteActionAsync(id, v => v.DrinkWineAndWatchSeries());

    public Task<bool> GoToBarAsync(int id) =>
        ExecuteActionAsync(id, v => v.GoToBar());

    public Task<bool> DrinkWithMarginalPeopleAsync(int id) =>
        ExecuteActionAsync(id, v => v.DrinkWithMarginalPeople());

    public Task<bool> SingInMetroAsync(int id) =>
        ExecuteActionAsync(id, v => v.SingInMetro());

    public Task<bool> SleepAsync(int id) =>
        ExecuteActionAsync(id, v => v.Sleep());
}
