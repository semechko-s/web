using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ValeraApi.Models;
using ValeraApi.Services;

namespace ValeraApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ValeraController : ControllerBase
{
    private readonly IValeraService _service;

    public ValeraController(IValeraService service)
    {
        _service = service;
    }

    // Общий список доступен только администратору.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<Valera>>> GetAll()
        => Ok(await _service.GetAllAsync());

    // Пользователь получает только принадлежащие ему записи.
    [HttpGet("my")]
    public async Task<ActionResult<List<Valera>>> GetMine()
        => Ok(await _service.GetByUserIdAsync(CurrentUserId()));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Valera>> GetById(int id)
    {
        var valera = await _service.GetByIdAsync(id);
        if (valera is null)
            return NotFound();

        if (!CanAccess(valera))
            return Forbid();

        return Ok(valera);
    }

    [HttpPost]
    public async Task<ActionResult<Valera>> Create(Valera valera)
    {
        // Владельца нельзя назначить из клиентского запроса.
        valera.UserId = CurrentUserId();

        var created = await _service.CreateAsync(valera);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Valera valera)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null)
            return NotFound();

        if (!CanAccess(existing))
            return Forbid();

        // Сохраняем исходного владельца независимо от тела запроса.
        valera.Id = existing.Id;
        valera.UserId = existing.UserId;

        return await _service.UpdateAsync(id, valera)
            ? NoContent()
            : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null)
            return NotFound();

        if (!CanAccess(existing))
            return Forbid();

        return await _service.DeleteAsync(id) ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/work")]
    public Task<IActionResult> Work(int id) =>
        ExecuteAction(id, _service.GoToWorkAsync);

    [HttpPost("{id:int}/nature")]
    public Task<IActionResult> ContemplateNature(int id) =>
        ExecuteAction(id, _service.ContemplateNatureAsync);

    [HttpPost("{id:int}/drink-series")]
    public Task<IActionResult> DrinkWineAndWatchSeries(int id) =>
        ExecuteAction(id, _service.DrinkWineAndWatchSeriesAsync);

    [HttpPost("{id:int}/bar")]
    public Task<IActionResult> GoToBar(int id) =>
        ExecuteAction(id, _service.GoToBarAsync);

    [HttpPost("{id:int}/drink-marginal")]
    public Task<IActionResult> DrinkWithMarginalPeople(int id) =>
        ExecuteAction(id, _service.DrinkWithMarginalPeopleAsync);

    [HttpPost("{id:int}/metro")]
    public Task<IActionResult> SingInMetro(int id) =>
        ExecuteAction(id, _service.SingInMetroAsync);

    [HttpPost("{id:int}/sleep")]
    public Task<IActionResult> Sleep(int id) =>
        ExecuteAction(id, _service.SleepAsync);

    private async Task<IActionResult> ExecuteAction(
        int id,
        Func<int, Task<bool>> action)
    {
        var valera = await _service.GetByIdAsync(id);
        if (valera is null)
            return NotFound();

        if (!CanAccess(valera))
            return Forbid();

        return await action(id)
            ? Ok()
            : BadRequest(new { message = "Это действие сейчас невозможно." });
    }

    private bool CanAccess(Valera valera) =>
        IsAdmin() || valera.UserId == CurrentUserId();

    private int CurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException(
                "В JWT отсутствует корректный идентификатор пользователя.");

        return userId;
    }

    private bool IsAdmin() => User.IsInRole("Admin");
}
