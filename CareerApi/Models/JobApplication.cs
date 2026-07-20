using System.ComponentModel.DataAnnotations;

namespace CareerApi.Models;

public class JobApplication
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string JobTitle { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? LinkedIn { get; set; }

    [MaxLength(300)]
    public string? Portfolio { get; set; }

    [MaxLength(2000)]
    public string? Message { get; set; }

    [Required, MaxLength(260)]
    public string ResumeFileName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string ResumeStoredPath { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
