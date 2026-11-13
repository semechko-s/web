using BudgetApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> Overview(CancellationToken cancellationToken)
    {
        var users = await db.Users.OrderBy(user => user.Id)
            .Select(user => new { user.Id, user.Username, user.Email, user.Role })
            .ToListAsync(cancellationToken);
        var transactionCount = await db.Transactions.CountAsync(cancellationToken);
        return Ok(new { users, transactionCount });
    }
}
