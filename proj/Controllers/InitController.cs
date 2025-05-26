using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using proj.db;

namespace proj.Controllers;



[ApiController]
[Route("[controller]/[action]")]

public class InitController : ControllerBase
{
    private readonly ILogger<InitController> _logger;
    private readonly MyDbContext _myDbContext;

    public InitController(
        ILogger<InitController> logger,
        MyDbContext myDbContext
        )
    {
        _logger = logger;
        _myDbContext = myDbContext;
    }


    [HttpGet]
    public async Task<IActionResult> FakeData()
    {

        List<User> users = new()
        {
            new User
            {
                Id = "id-1",
                Name = "Вася",
                Email = "v@ru",
                Password = "v"
            },
            new User
            {
                Id = "id-2",
                Name = "Петя",
                Email = "p@ru",
                Password= "p"
            }
        };

        List<Place> places = new()
        {
            new Place
            {
                Id = "id-place-1",
                Name = "Дом",
                Description = "desc1",
                Lat = 55,
                Lon = 37
            },
            new Place
            {
                Id = "id-place-2",
                Name = "Работа",
                Description = "desc2",
                Lat = 57,
                Lon = 30
            }
        };

        List<UserPlace> userplaces = new()
        {
            new UserPlace
            {
                UserId = "id-1",
                PlaceId = places[0].Id,
                
            },

            new UserPlace
            {
                UserId = "id-1",
                PlaceId = places[1].Id,

            },
            new UserPlace
            {
                UserId = "id-2",
                PlaceId = places[1].Id,
            }
        };

        List<PublicRoute> routes = new()
        {
            new PublicRoute
            {
                UserId = "id-1",
                PlaceIds = [places[0].Id, places[1].Id ],

            },
            new PublicRoute
            {
                UserId = "id-2",
                PlaceIds = [places[0].Id],

            }
        };

        List<Photo> photos = new()
        {
            new Photo
            {
                UserId = users[0].Id,
                PlaceId = places[0].Id,
                Filename = "ph1",
                Image = null,
                Ext = "jpeg"
            },
            new Photo
            {
                UserId = users[1].Id,
                PlaceId = places[1].Id,
                Filename = "ph2",
                Image = null,
                Ext = "jpeg"
            }
        };



        _myDbContext.User.AddRange(users);
        await _myDbContext.SaveChangesAsync();

        _myDbContext.Place.AddRange(places);
        await _myDbContext.SaveChangesAsync();

        _myDbContext.UserPlace.AddRange(userplaces);
        await _myDbContext.SaveChangesAsync();

        _myDbContext.PublicRoute.AddRange(routes);
        await _myDbContext.SaveChangesAsync();

        //_myDbContext.Photo.AddRange(photos);
        //await _myDbContext.SaveChangesAsync();

        return Ok(new {res = "Ok"});

    }

    [HttpGet]
    public async Task<IActionResult> Clear()
    {

        List<User> users = await _myDbContext.User
            .ToListAsync();

        _myDbContext.User.RemoveRange(users);
        await _myDbContext.SaveChangesAsync();

        List<Place> places = await _myDbContext.Place
            .ToListAsync();

        _myDbContext.Place.RemoveRange(places);
        await _myDbContext.SaveChangesAsync();

        List<UserPlace> usersp = await _myDbContext.UserPlace
            .ToListAsync();

        _myDbContext.UserPlace.RemoveRange(usersp);
        await _myDbContext.SaveChangesAsync();

        try
        {
            List<PublicRoute> routes = await _myDbContext.PublicRoute.ToListAsync();
            _myDbContext.PublicRoute.RemoveRange(routes);

        }
        catch (Exception ex) {
        }

        await _myDbContext.SaveChangesAsync();

        List<Photo> photos = await _myDbContext.Photo
            .ToListAsync();

        _myDbContext.Photo.RemoveRange(photos);
        await _myDbContext.SaveChangesAsync();

        return Ok(new { users });

    }



}
