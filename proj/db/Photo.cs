using NanoidDotNet;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace proj.db;


[Table("photo")]
public class Photo
{
    [Key]
    public string Id { get; set; } = Nanoid.Generate();

    [ForeignKey(nameof(Place))]
    public string PlaceId { get; set; }

    [ForeignKey(nameof(User))]
    public string UserId { get; set; }


    public byte[]? Image { get; set; }

    public string Filename { get; set; }
    public string Ext { get; set; }


    public Place Place { get; set; }
    public User User { get; set; }
}
