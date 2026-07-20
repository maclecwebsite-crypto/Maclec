using Microsoft.EntityFrameworkCore;
using CareerApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<CareerDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("CareerDb"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("CareerDb"))
    ));;

const string CareerSitePolicy = "CareerSitePolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CareerSitePolicy, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CareerDbContext>();
    db.Database.EnsureCreated();
}
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(CareerSitePolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
