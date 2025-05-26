using NanoidDotNet;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace proj.db;

[Table("public_route")]
public class PublicRoute
{
    [Key]
    public string Id { get; set; } = Nanoid.Generate();

    [ForeignKey(nameof(User))]
    public string UserId { get; set; }

    public string? NameRoute { get; set; }

    public List<string> PlaceIds { get; set; }


}


