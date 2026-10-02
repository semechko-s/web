using ValeraApi.Models;

namespace ValeraApi.Services;

public interface IValeraService
{
    Task<List<Valera>> GetAllAsync();
    Task<Valera?> GetByIdAsync(int id);
    Task<Valera> CreateAsync(Valera valera);
    Task<bool> UpdateAsync(int id, Valera valera);
    Task<bool> DeleteAsync(int id);
    Task<bool> GoToWorkAsync(int id);
    Task<bool> ContemplateNatureAsync(int id);
    Task<bool> DrinkWineAndWatchSeriesAsync(int id);
    Task<bool> GoToBarAsync(int id);
    Task<bool> DrinkWithMarginalPeopleAsync(int id);
    Task<bool> SingInMetroAsync(int id);
    Task<bool> SleepAsync(int id);
}
