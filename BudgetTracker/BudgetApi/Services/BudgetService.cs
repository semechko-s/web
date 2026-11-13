using BudgetApi.Data;
using BudgetApi.DTOs;
using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Services;

public class BudgetService(AppDbContext db)
{
    private IQueryable<Transaction> OwnedBy(int userId) =>
        db.Transactions.Where(item => item.UserId == userId);

    public Task<List<TransactionDto>> List(int userId, DateOnly start)
    {
        var end = start.AddMonths(1);
        return OwnedBy(userId).Where(item => item.Date >= start && item.Date < end)
            .OrderByDescending(item => item.Date).ThenByDescending(item => item.Id)
            .Select(item => new TransactionDto(item.Id, item.IsIncome, item.AmountKopecks,
                item.Date, item.Category, item.Note))
            .ToListAsync();
    }

    public async Task<TransactionDto?> Get(int userId, int id)
    {
        var item = await Find(userId, id);
        return item is null ? null : ToDto(item);
    }

    public async Task<TransactionDto> Create(int userId, TransactionRequest request)
    {
        var item = new Transaction { UserId = userId };
        Apply(item, request);
        db.Transactions.Add(item);
        await db.SaveChangesAsync();
        return ToDto(item);
    }

    public async Task<TransactionDto?> Update(int userId, int id, TransactionRequest request)
    {
        var item = await Find(userId, id);
        if (item is null) return null;
        Apply(item, request);
        await db.SaveChangesAsync();
        return ToDto(item);
    }

    public async Task<bool> Delete(int userId, int id) =>
        await OwnedBy(userId).Where(item => item.Id == id).ExecuteDeleteAsync() > 0;

    private Task<Transaction?> Find(int userId, int id) =>
        OwnedBy(userId).SingleOrDefaultAsync(item => item.Id == id);

    private static void Apply(Transaction item, TransactionRequest request)
    {
        item.IsIncome = request.IsIncome!.Value;
        item.AmountKopecks = request.AmountKopecks;
        item.Date = request.Date!.Value;
        item.Category = request.Category.Trim();
        item.Note = request.Note?.Trim() ?? "";
    }

    private static TransactionDto ToDto(Transaction item) =>
        new(item.Id, item.IsIncome, item.AmountKopecks, item.Date, item.Category, item.Note);
}
