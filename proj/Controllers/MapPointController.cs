using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NanoidDotNet;
using proj.db;
using proj.Dto;
using System.Reflection.Metadata;

namespace proj.Controllers;


[ApiController]
[Route("[controller]/[action]")]

public class MapPointController : ControllerBase
{
    private readonly MyDbContext _myDbContext;

    public MapPointController(
        MyDbContext myDbContext
        )
    {
        _myDbContext = myDbContext;
    }


    [HttpGet("{userId}")]
    public async Task<IActionResult> Gets(string userId)
    {
        
        var places_list = await _myDbContext.UserPlace.Where(x => x.UserId == userId).Select(s => s.PlaceId).ToListAsync();

        List<MapPointGetDto> res = [];

        foreach (var place in places_list)
        {
            var info = await _myDbContext.Place.Where(x => x.Id == place).ToListAsync();
            foreach (var item in info)
            {
                var tmp = new MapPointGetDto()
                {
                    lat = item.Lat,
                    lng = item.Lon,
                    name = item.Name,
                    placeId = item.Id,
                };

                res.Add(tmp);
            }

        }

        return Ok(res);

    }

    [HttpPost]
    public async Task<IActionResult> Post(PlaceDto placeDto)
    {
        var p = new Place
        {
            Id = placeDto.PlaceId,
            Name = placeDto.Name,
            Lat = placeDto.Lat,
            Lon = placeDto.Lng,
            Description = string.Empty,
            
        };


        var up = new UserPlace
        {
            UserId = placeDto.UserId,
            PlaceId = placeDto.PlaceId

        };

        _myDbContext.Place.Add(p);
        _myDbContext.UserPlace.Add(up);
        
        

        
        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "Ok" });
    }

    [HttpDelete("{userId}/{lat}/{lng}")]
    public async Task<IActionResult> Delete(string userId, float lat, float lng)
    {


        Place? place = await _myDbContext.Place.Where(x => x.Lat == lat && x.Lon == lng).FirstOrDefaultAsync();

        if (place != null)
        {
            UserPlace? usersp = await _myDbContext.UserPlace.Where(x => x.UserId == userId && x.PlaceId == place.Id).FirstOrDefaultAsync();
            if (usersp != null) {  _myDbContext.UserPlace.Remove(usersp); }
            _myDbContext.Place.Remove(place);
        }

        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "Ok" });
    }

    [HttpPost]
    public async Task<IActionResult> AddRoute(RouteDto routeDto)
    {
        var r = new PublicRoute
        {   
            UserId = routeDto.UserId,
            NameRoute = routeDto.NameRoute,
            PlaceIds = routeDto.PlaceIds,
        };

        _myDbContext.PublicRoute.Add(r);
        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "Ok" });
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetRoutes(string userId)
    {

        List<PublicRoute> places_list = await _myDbContext.PublicRoute.Where(x => x.UserId == userId).ToListAsync();

        List<RouteDto> res = [];

        foreach (var places in places_list)
        {
            var tmp = new RouteDto(){
                UserId = userId,
                NameRoute = places.NameRoute,
                PlaceIds = places.PlaceIds,
            };

             res.Add(tmp);
            

        }

        return Ok(res);

    }

    [HttpPost]
    public async Task<IActionResult> ShareRoute(ShareDto shareDto)
    {

        var id = _myDbContext.User.Where(x => x.Email == shareDto.UserLogin).FirstOrDefault()?.Id;
        if (id != null)
        {
            var route = _myDbContext.PublicRoute.Where(x => x.UserId == shareDto.UserId && x.NameRoute == shareDto.NameRoute).FirstOrDefault()?.PlaceIds;
            

            List<String> plL = new List<String>();
            for (var i = 0; i < route.Count; i++) {
                var info = _myDbContext.Place.Where(x => x.Id == route[i]).FirstOrDefault();
                var pl = new Place ()
                {
                    Id = Nanoid.Generate(),
                    Lat = info.Lat,
                    Lon = info.Lon,
                    Name = info.Name,
                    Description = info.Description,
                    Photos = info.Photos,

                };
                _myDbContext.Place.Add(pl);

                var up = new UserPlace
                {
                    UserId = id,
                    PlaceId = pl.Id

                };
                plL.Add(pl.Id);
                

                

                _myDbContext.UserPlace.Add(up);
            }

            var r = new PublicRoute
            {
                UserId = id,
                NameRoute = shareDto.NameRoute,
                PlaceIds = plL,
            };

            _myDbContext.PublicRoute.Add(r);
            await _myDbContext.SaveChangesAsync();
        }
        

        return Ok(new { res = "Ok" });
    }

    [HttpPost]
    public async Task<IActionResult> EnterCode(EnterCodeDto enterCode)
    {
        var route = _myDbContext.PublicRoute.Where(x => x.Id == enterCode.Code).FirstOrDefault();
        if (route != null)
        {
            List<String> Arr = new List<String>();
            for (var i = 0; i < route.PlaceIds.Count; i++)
            {
                var info = _myDbContext.Place.Where(x => x.Id == route.PlaceIds[i]).FirstOrDefault();

                var pl = new Place
                {
                    Id = Nanoid.Generate(),
                    Lat = info.Lat,
                    Lon = info.Lon,
                    Name = info.Name,
                    Description = info.Description,
                    Photos = info.Photos,

                };

                var up = new UserPlace
                {
                    UserId = enterCode.UserId,
                    PlaceId = pl.Id,

                };

                Arr.Add(pl.Id);

                

                _myDbContext.Place.Add(pl);

                _myDbContext.UserPlace.Add(up);

            }
            var r = new PublicRoute
            {
                UserId = enterCode.UserId,
                NameRoute = route.NameRoute,
                PlaceIds = Arr,
            };

            _myDbContext.PublicRoute.Add(r);


            await _myDbContext.SaveChangesAsync();
        }


        return Ok(new { res = "Ok" });
    }

    [HttpGet("{userId}/{nameRoute}")]
    public async Task<IActionResult> GetCode(string userId, string nameRoute)
    {

        var route = await _myDbContext.PublicRoute
        .Where(x => x.UserId == userId && x.NameRoute == nameRoute)
        .FirstOrDefaultAsync();
        
        if (route != null)
        {
            return Ok(new { route.Id });
        } else
        {
            return Ok("a");
        }

            

    }

    [HttpGet("{userId}/{PlaceId}")]
    public async Task<IActionResult> GetPlaceInfo(string userId, string PlaceId)
    {

        var old = await _myDbContext.Place.Where(x => x.Id == PlaceId).FirstOrDefaultAsync();
        var aaa = new GetPlaceDto
        {
            Id = old.Id,
            Name = old.Name,
            Description = old.Description,
            Lat = old.Lat,
            Lon = old.Lon,
            Photos = old.Photos,

        };
        return Ok( aaa);
        
    }


    [HttpPost]
    public async Task<IActionResult> AddDescription(DescDto descDto)
    {
        var old = _myDbContext.UserPlace.Where(x => x.UserId == descDto.UserId && x.PlaceId == descDto.PlaceId).FirstOrDefault();
        var old_place = _myDbContext.Place.Where(x => x.Id == old.PlaceId).FirstOrDefault();
        old_place.Description = descDto.Description;
        _myDbContext.Place.Update(old_place);
        //old.Place.Description = descDto.Description;

        //_myDbContext.UserPlace.Update(old);
        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "Ok" });
    }

    [HttpPost]
    public async Task<IActionResult> AddName(DescDto descDto)
    {
        var old_place = _myDbContext.Place.Where(x => x.Id == descDto.PlaceId).FirstOrDefault();
        old_place.Name = descDto.Description;
        _myDbContext.Place.Update(old_place);
        
        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "Ok" });
    }

    [HttpPost]
    /*public async Task<IActionResult> AddPhoto(PhotoDto photoDto)
    {
        var ph = new Photo
        {
            UserId = photoDto.UserId,
            Ext = photoDto.Ext,
            PlaceId = photoDto.PlaceId,
            Filename = photoDto.Filename,
            Image = photoDto.Image,

        };

        var place = _myDbContext.Place.Where(x => x.Id == photoDto.PlaceId).FirstOrDefault();
        var photo_list = place.Photos;
        if (photo_list == null)
        {
            photo_list = [];
        }
        photo_list.Add(ph);
        place.Photos = photo_list;
        _myDbContext.Place.Update(place);
        _myDbContext.Photo.Add(ph);
        

        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "Ok" });
    }*/

    [HttpGet("{userId}/{PlaceId}")]
    public async Task<IActionResult> ShowPhotos(string userId, string PlaceId)
    {
        List<Photo> res = [];
        var old = await _myDbContext.Place.Where(x => x.Id == PlaceId).FirstOrDefaultAsync();
        if (old != null) {
            var list = old.Photos;
            for (var i = 0; i < list.Count; i++)
            {
                var a = new Photo
                {
                    PlaceId = list[i].PlaceId,
                    UserId = list[i].UserId,
                    Ext = list[i].Ext,
                    Filename = list[i].Filename,
                    Image = list[i].Image,

                };
                res.Add(a);
            }
            
        }
        return Ok(res);
    }

    [HttpPost]

    public async Task<ActionResult> Photo([FromForm] FileUploaderRequest dto)
    {
        
        if (!(dto.Image?.Length > 0)) return BadRequest("Нулевая длина файла");

        byte[]? bytes = null;
        string err = string.Empty;
        byte[]? thumbnailBytes = null;
        using (MemoryStream ms = new MemoryStream())
        {
            try
            {
                await dto.Image.CopyToAsync(ms);
                bytes = ms.ToArray();
                ms.Position = 0;
                //thumbnailBytes = GetReducedImage(64, 64, bytes, dto.Ext, dto.id);
            }
            catch (Exception ex)
            {
                err = $"Ошибка получения файла. {ex.Message}";
                //Log.Error(ex, err);
            }
        }
        if (!string.IsNullOrEmpty(err)) return BadRequest(err);
        if (bytes is null) return BadRequest("Длина файла ноль");

        //Blob? blob = await context.Blob
        //    .FirstOrDefaultAsync(x => x.id == dto.id && x.orderid == dto.orderId && x.dealerid == jwt.dealerId);

        
        var blob = new Photo ()
        {
            UserId = dto.UserId,
            PlaceId = dto.PlaceId,
            Ext = string.IsNullOrEmpty(dto.Image.ContentType) ? String.Empty : dto.Image.ContentType,
            Filename = string.IsNullOrEmpty(dto.Image.FileName) ? String.Empty : dto.Image.FileName,
            //ObjectUrl = dto.ObjectUrl,
            Image = bytes,
        };
        _myDbContext.Photo.Add(blob);
        await _myDbContext.SaveChangesAsync();

        return Ok(new { res = "ok"});
    }

    [HttpGet("{UserId}/{PlaceId}")]
    public async Task<ActionResult> Download(string UserId, string PlaceId)
    {

        var userPlace = await _myDbContext.UserPlace
            .Include(i => i.Place)
            .ThenInclude(t => t.Photos)
            .Where(x => x.UserId == UserId && x.PlaceId == PlaceId)
            .FirstOrDefaultAsync();
        List<BlobDto> res = [];
        if (userPlace?.Place?.Photos?.Count > 0)
        { 
            for (var i = 0; i < userPlace?.Place?.Photos?.Count; i++)
            {
                var blb = new BlobDto
                {
                    fileName = userPlace.Place.Photos[i].Filename,
                    extension = userPlace.Place.Photos[i].Ext,
                    thumbnailBytes = userPlace.Place.Photos[i].Image,
                };

                res.Add(blb);
            }
             
        }
        return Ok(res);

        
    }


    [HttpGet]
    public async Task<ActionResult> Test()
    {
        string UserId = "id-1";
        string PlaceId = "id-place-1";
        var userPlace = await _myDbContext.UserPlace
            .Include(i => i.Place)
            .ThenInclude(t => t.Photos)
            .Where(x => x.UserId == UserId && x.PlaceId == PlaceId)
            /*
            .Select(s => new BlobDto
            {
                fileName = s.Place.p Filename,
                extension = s.Ext,
                thumbnailBytes = s.Image
            }*/
            .FirstOrDefaultAsync();

        if (userPlace?.Place?.Photos?.Count > 0)
        {
            var blb = new BlobDto
            {
                fileName = userPlace.Place.Photos[0].Filename,
                extension = userPlace.Place.Photos[0].Ext,
                thumbnailBytes = userPlace.Place.Photos[0].Image,
            };
            return Ok(blb);
        }
        return BadRequest();


    }

    [HttpGet("{Email}/{Password}")]
    public async Task<ActionResult> CheckPassword(string Email, string Password)
    {
        var pass = await _myDbContext.User.Where(x => x.Email == Email).FirstOrDefaultAsync();
        String str = "neok";
        if (pass == null)
        {
            str = "neok";
            return Ok(new { res = str, name = ""});
        }
        if (pass?.Password == Password)

        {
            str = pass.Id;
            return Ok(new { res = str, name = pass.Name });
        }
        str = "neok";
        return Ok(new { res = str, name = "" });
    }

    [HttpPost]
    public async Task<ActionResult> Sign(SignDto signDto)
    {
        var u = new User()
        {
            Email = signDto.Email,
            Name = signDto.Name,
            Password = signDto.Password,
        };
        _myDbContext.User.Add(u);
        await _myDbContext.SaveChangesAsync();
        return Ok(new { res = "ok" });
    }

}
