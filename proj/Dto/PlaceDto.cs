using proj.db;

namespace proj.Dto;

public class PlaceDto
{
    public string UserId { get; set; }

    public string PlaceId { get; set; }
    public string Name { get; set; }

    public string? Description { get; set; }

    public float Lat { get; set; }

    public float Lng { get; set; }




}
