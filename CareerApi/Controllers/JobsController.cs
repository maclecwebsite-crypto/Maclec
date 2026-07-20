using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CareerApi.Data;

namespace CareerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly CareerDbContext _db;

    public JobsController(CareerDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? department, [FromQuery] string? search)
    {
        var query = _db.JobPostings.Where(j => j.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(department) && !department.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(j => j.Department == department);
        }

        var jobs = await query.OrderByDescending(j => j.PostedDate).ToListAsync();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            jobs = jobs.Where(j =>
                j.Title.ToLowerInvariant().Contains(term) ||
                j.Summary.ToLowerInvariant().Contains(term) ||
                j.Keywords.ToLowerInvariant().Contains(term) ||
                j.Location.ToLowerInvariant().Contains(term)).ToList();
        }

        return Ok(jobs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var job = await _db.JobPostings.FindAsync(id);
        if (job is null || !job.IsActive) return NotFound();
        return Ok(job);
    }
}
