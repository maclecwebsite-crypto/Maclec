using Microsoft.AspNetCore.Mvc;
using CareerApi.Data;
using CareerApi.Models;

namespace CareerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private static readonly string[] AllowedExtensions = { ".pdf", ".doc", ".docx" };
    private const long MaxResumeBytes = 10 * 1024 * 1024; // 10 MB

    private readonly CareerDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ApplicationsController(CareerDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpPost]
    [RequestSizeLimit(MaxResumeBytes + 1024 * 1024)]
    public async Task<IActionResult> Submit([FromForm] JobApplicationSubmission form)
    {
        if (form.Resume is null || form.Resume.Length == 0)
            return BadRequest(new { error = "Resume file is required." });

        var extension = Path.GetExtension(form.Resume.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { error = "Resume must be a PDF, DOC, or DOCX file." });

        if (form.Resume.Length > MaxResumeBytes)
            return BadRequest(new { error = "Resume must be smaller than 10 MB." });

        var uploadsRoot = Path.Combine(_env.ContentRootPath, "App_Data", "resumes");
        Directory.CreateDirectory(uploadsRoot);

        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var storedPath = Path.Combine(uploadsRoot, storedFileName);

        await using (var stream = System.IO.File.Create(storedPath))
        {
            await form.Resume.CopyToAsync(stream);
        }

        var application = new JobApplication
        {
            JobTitle = form.JobTitle,
            FirstName = form.FirstName,
            LastName = form.LastName,
            Email = form.Email,
            Phone = form.Phone,
            LinkedIn = form.LinkedIn,
            Portfolio = form.Portfolio,
            Message = form.Message,
            ResumeFileName = form.Resume.FileName,
            ResumeStoredPath = Path.Combine("App_Data", "resumes", storedFileName)
        };

        _db.JobApplications.Add(application);
        await _db.SaveChangesAsync();

        return Created(string.Empty, new { id = application.Id, submittedAt = application.SubmittedAt });
    }
}

public class JobApplicationSubmission
{
    [FromForm(Name = "job_title")]
    public string JobTitle { get; set; } = string.Empty;

    [FromForm(Name = "first_name")]
    public string FirstName { get; set; } = string.Empty;

    [FromForm(Name = "last_name")]
    public string LastName { get; set; } = string.Empty;

    [FromForm(Name = "email")]
    public string Email { get; set; } = string.Empty;

    [FromForm(Name = "phone")]
    public string Phone { get; set; } = string.Empty;

    [FromForm(Name = "linkedin")]
    public string? LinkedIn { get; set; }

    [FromForm(Name = "portfolio")]
    public string? Portfolio { get; set; }

    [FromForm(Name = "message")]
    public string? Message { get; set; }

    [FromForm(Name = "resume")]
    public IFormFile? Resume { get; set; }
}
