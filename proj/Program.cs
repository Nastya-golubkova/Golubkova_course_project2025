using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using proj.db;

var builder = WebApplication.CreateBuilder(args);


string connStr = builder.Configuration.GetConnectionString("docker");
// Add services to the container.

builder.Services.AddCors(options => options.AddPolicy("Allow8100", bldr => bldr
    .WithOrigins("http://localhost:8100", "https://localhost", "http://localhost")
    .AllowAnyHeader()
    .AllowAnyMethod()    
));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo()
    {
        Title = "TravelBlog",
        Version = "v1",       
    });   
});

builder.Services.AddDbContext<MyDbContext>(options =>
{
    options.UseNpgsql(connStr, param => param.SetPostgresVersion(Version.Parse("16.8")));    
    options.EnableDetailedErrors();
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(opt =>
    {
        opt.SerializeAsV2 = true;
    });
    app.UseSwaggerUI();
}

app.UseCors("Allow8100");
//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
