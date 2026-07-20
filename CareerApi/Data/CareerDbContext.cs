using Microsoft.EntityFrameworkCore;
using CareerApi.Models;

namespace CareerApi.Data;

public class CareerDbContext : DbContext
{
    public CareerDbContext(DbContextOptions<CareerDbContext> options) : base(options) { }

    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var listComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
            (a, b) => (a ?? new()).SequenceEqual(b ?? new()),
            v => v.Aggregate(0, (hash, s) => HashCode.Combine(hash, s.GetHashCode())),
            v => v.ToList());

        modelBuilder.Entity<JobPosting>()
            .Property(j => j.Responsibilities)
            .HasConversion(
                v => string.Join("||", v),
                v => v.Length == 0 ? new List<string>() : v.Split("||", StringSplitOptions.None).ToList())
            .Metadata.SetValueComparer(listComparer);

        modelBuilder.Entity<JobPosting>()
            .Property(j => j.Requirements)
            .HasConversion(
                v => string.Join("||", v),
                v => v.Length == 0 ? new List<string>() : v.Split("||", StringSplitOptions.None).ToList())
            .Metadata.SetValueComparer(listComparer);
    }
}
