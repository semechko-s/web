using System.ComponentModel.DataAnnotations;

namespace BudgetApi.DTOs;
public record LoginRequest([Required, MaxLength(254)] string Email, [Required] string Password);
