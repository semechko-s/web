using System.Globalization;
using System.Security.Claims;
using BudgetApi.DTOs;
using BudgetApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApi.Controllers;

[Authorize]
[ApiController]
[Route("api/transactions")]
public class TransactionsController(BudgetService service) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<TransactionDto>>> List([FromQuery] string month)
    {
        if (!DateOnly.TryParseExact(month + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var start) || start.Year is < 1900 or > 2100)
            return BadRequest(new { message = "Укажите месяц в формате ГГГГ-ММ (1900–2100)." });

        return await service.List(UserId, start);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransactionDto>> Get(int id)
    {
        var item = await service.Get(UserId, id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(TransactionRequest request)
    {
        if (!Valid(request)) return ValidationProblem(ModelState);
        var item = await service.Create(UserId, request);
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TransactionDto>> Update(int id, TransactionRequest request)
    {
        if (!Valid(request)) return ValidationProblem(ModelState);
        var item = await service.Update(UserId, id, request);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await service.Delete(UserId, id) ? NoContent() : NotFound();

    private bool Valid(TransactionRequest request)
    {
        if (request.IsIncome is null) ModelState.AddModelError("isIncome", "Выберите тип операции.");
        if (request.Date is null || request.Date.Value.Year is < 1900 or > 2100)
            ModelState.AddModelError("date", "Укажите дату с 1900 по 2100 год.");
        return ModelState.IsValid;
    }
}
