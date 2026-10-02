using Microsoft.AspNetCore.Mvc;
using ValeraApi.Models;
using ValeraApi.Services;

namespace ValeraApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ValeraController : ControllerBase
{
    private readonly IValeraService _service;

    public ValeraController(IValeraService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<Valera>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Valera>> GetById(int id)
    {
        var valera = await _service.GetByIdAsync(id);
        return valera is null ? NotFound() : Ok(valera);
    }

    [HttpPost]
    public async Task<ActionResult<Valera>> Create(Valera valera)
    {
        var created = await _service.CreateAsync(valera);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Valera valera)
    {
        if (await _service.UpdateAsync(id, valera) is false)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (await _service.DeleteAsync(id) is false)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id:int}/work")]
    public Task<IActionResult> GoToWork(int id) => ExecuteAction(id, _service.GoToWorkAsync);

    [HttpPost("{id:int}/nature")]
    public Task<IActionResult> ContemplateNature(int id) => ExecuteAction(id, _service.ContemplateNatureAsync);

    [HttpPost("{id:int}/drink-series")]
    public Task<IActionResult> DrinkWineAndWatchSeries(int id) => ExecuteAction(id, _service.DrinkWineAndWatchSeriesAsync);

    [HttpPost("{id:int}/bar")]
    public Task<IActionResult> GoToBar(int id) => ExecuteAction(id, _service.GoToBarAsync);

    [HttpPost("{id:int}/drink-marginal")]
    public Task<IActionResult> DrinkWithMarginalPeople(int id) => ExecuteAction(id, _service.DrinkWithMarginalPeopleAsync);

    [HttpPost("{id:int}/metro")]
    public Task<IActionResult> SingInMetro(int id) => ExecuteAction(id, _service.SingInMetroAsync);

    [HttpPost("{id:int}/sleep")]
    public Task<IActionResult> Sleep(int id) => ExecuteAction(id, _service.SleepAsync);

    private static async Task<IActionResult> ExecuteAction(int id, Func<int, Task<bool>> action)
    {
        var success = await action(id);
        return success ? new OkResult() : new BadRequestObjectResult("Valera not found or action cannot be performed.");
    }
}
