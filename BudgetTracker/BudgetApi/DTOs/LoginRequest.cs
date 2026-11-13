using System.ComponentModel.DataAnnotations;

namespace BudgetApi.DTOs;
public record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
