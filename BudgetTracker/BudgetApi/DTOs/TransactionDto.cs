using System.ComponentModel.DataAnnotations;

namespace BudgetApi.DTOs;

public record TransactionRequest(
    bool? IsIncome,
    [Range(1, 100_000_000_000)] long AmountKopecks,
    DateOnly? Date,
    [Required, StringLength(60)] string Category,
    [StringLength(200)] string? Note);

public record TransactionDto(
    int Id, bool IsIncome, long AmountKopecks, DateOnly Date, string Category, string Note);
