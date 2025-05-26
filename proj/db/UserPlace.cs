using NanoidDotNet;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace proj.db;

[Table("userplace")]
public class UserPlace
{
    [Key]
    public string Id { get; set; } = Nanoid.Generate();

    [ForeignKey(nameof(User))]
    public string UserId { get; set; }

    [ForeignKey(nameof(Place))]
    public string PlaceId { get; set; }


    public User User { get; set; }
    public Place Place { get; set; }
}
