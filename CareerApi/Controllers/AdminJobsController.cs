using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CareerApi.Auth;
using CareerApi.Data;
using CareerApi.Models;

namespace CareerApi.Controllers;

[ApiController]
[Route("api/admin/jobs")]
[AdminAuth]
public class AdminJobsController : ControllerBase
{
    private readonly CareerDbContext _db;

    public AdminJobsController(CareerDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var jobs = await _db.JobPostings.OrderByDescending(j => j.PostedDate).ToListAsync();
        return Ok(jobs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var job = await _db.JobPostings.FindAsync(id);
        if (job is null) return NotFound();
        return Ok(job);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JobPostingUpsertRequest request)
    {
        var job = new JobPosting
        {
            Title = request.Title,
            Department = request.Department,
            Location = request.Location,
            EmploymentType = request.EmploymentType,
            Summary = request.Summary,
            Responsibilities = request.Responsibilities ?? new(),
            Requirements = request.Requirements ?? new(),
            Keywords = request.Keywords,
            IsActive = request.IsActive,
            PostedDate = DateTime.UtcNow
        };

        _db.JobPostings.Add(job);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] JobPostingUpsertRequest request)
    {
        var job = await _db.JobPostings.FindAsync(id);
        if (job is null) return NotFound();

        job.Title = request.Title;
        job.Department = request.Department;
        job.Location = request.Location;
        job.EmploymentType = request.EmploymentType;
        job.Summary = request.Summary;
        job.Responsibilities = request.Responsibilities ?? new();
        job.Requirements = request.Requirements ?? new();
        job.Keywords = request.Keywords;
        job.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return Ok(job);
    }

    [HttpPatch("{id:int}/publish")]
    public async Task<IActionResult> Publish(int id)
    {
        var job = await _db.JobPostings.FindAsync(id);
        if (job is null) return NotFound();
        job.IsActive = true;
        await _db.SaveChangesAsync();
        return Ok(job);
    }

    [HttpPatch("{id:int}/unpublish")]
    public async Task<IActionResult> Unpublish(int id)
    {
        var job = await _db.JobPostings.FindAsync(id);
        if (job is null) return NotFound();
        job.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(job);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var job = await _db.JobPostings.FindAsync(id);
        if (job is null) return NotFound();

        _db.JobPostings.Remove(job);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
