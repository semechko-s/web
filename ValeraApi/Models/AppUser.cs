using System.ComponentModel.DataAnnotations;

namespace ValeraApi.Models;

public class AppUser
{
    public int Id { get; set; }
    [MaxLength(254)] public string Email { get; set; } = "";
    [MaxLength(80)] public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    [MaxLength(20)] public string Role { get; set; } = "User";
}
