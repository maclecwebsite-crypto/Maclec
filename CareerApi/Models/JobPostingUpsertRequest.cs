namespace CareerApi.Models;

public class JobPostingUpsertRequest
{
    public string Title { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = "Full-time";
    public string Summary { get; set; } = string.Empty;
    public List<string> Responsibilities { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public string Keywords { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
