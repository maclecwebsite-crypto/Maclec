using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using CareerApi.Auth;
using CareerApi.Data;

namespace CareerApi.Controllers;

[ApiController]
[Route("api/admin/applications")]
[AdminAuth]
public class AdminApplicationsController : ControllerBase
{
    private readonly CareerDbContext _db;
    private readonly IWebHostEnvironment _env;
    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();

    public AdminApplicationsController(CareerDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications = await _db.JobApplications
            .OrderByDescending(a => a.SubmittedAt)
            .Select(a => new
            {
                a.Id,
                a.JobTitle,
                a.FirstName,
                a.LastName,
                a.Email,
                a.Phone,
                a.LinkedIn,
                a.Portfolio,
                a.Message,
                a.ResumeFileName,
                a.SubmittedAt,
                ResumeDownloadUrl = $"/api/admin/applications/{a.Id}/resume"
            })
            .ToListAsync();

        return Ok(applications);
    }

    [HttpGet("{id:int}/resume")]
    public async Task<IActionResult> DownloadResume(int id)
    {
        var application = await _db.JobApplications.FindAsync(id);
        if (application is null) return NotFound();

        var fullPath = Path.Combine(_env.ContentRootPath, application.ResumeStoredPath);
        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound(new { error = "Resume file is missing from storage." });
        }

        if (!ContentTypeProvider.TryGetContentType(fullPath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
        return File(bytes, contentType, application.ResumeFileName);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var application = await _db.JobApplications.FindAsync(id);
        if (application is null) return NotFound();

        var fullPath = Path.Combine(_env.ContentRootPath, application.ResumeStoredPath);
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }

        _db.JobApplications.Remove(application);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
