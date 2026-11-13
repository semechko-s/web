namespace BudgetApi.Models;

public class Transaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public bool IsIncome { get; set; }
    public long AmountKopecks { get; set; }
    public DateOnly Date { get; set; }
    public string Category { get; set; } = "";
    public string Note { get; set; } = "";
}
