using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using proj.db;
using System.Threading.Tasks;

namespace proj.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;
    private readonly MyDbContext _myDbContext;

    public WeatherForecastController(
        ILogger<WeatherForecastController> logger,
        MyDbContext myDbContext
        )
    {
        _logger = logger;
        _myDbContext = myDbContext;
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public async Task<IEnumerable<WeatherForecast>> Get()
    {
        /*
        var all = _myDbContext.User
            //.Where(x => x.Name == "")
            .ToList();

        await _myDbContext.SaveChangesAsync();

        */
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .ToArray();
    }
}
