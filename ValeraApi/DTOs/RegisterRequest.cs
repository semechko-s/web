using System.ComponentModel.DataAnnotations;

namespace ValeraApi.DTOs;
public record RegisterRequest(
    [Required, EmailAddress, MaxLength(254)] string Email,
    [Required, MinLength(8), MaxLength(128)] string Password,
    [Required, MinLength(2), MaxLength(80)] string Username);
