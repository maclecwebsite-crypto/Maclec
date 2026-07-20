using System.ComponentModel.DataAnnotations;

namespace CareerApi.Models;

public class JobPosting
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Department { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string EmploymentType { get; set; } = "Full-time";

    [Required]
    public string Summary { get; set; } = string.Empty;

    public List<string> Responsibilities { get; set; } = new();

    public List<string> Requirements { get; set; } = new();

    [MaxLength(300)]
    public string Keywords { get; set; } = string.Empty;

    public DateTime PostedDate { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
}
