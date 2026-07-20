using Microsoft.EntityFrameworkCore;
using CareerApi.Data;
using Pomelo.EntityFrameworkCore.MySql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<CareerDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("CareerDb"),
        new MySqlServerVersion(new Version(8, 0, 36))
    ));

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
    db.Database.Migrate();
}

app.UseHttpsRedirection();
app.UseCors(CareerSitePolicy);
app.UseAuthorization();
app.MapControllers();
app.Run();