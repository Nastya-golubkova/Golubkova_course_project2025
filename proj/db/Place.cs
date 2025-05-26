using NanoidDotNet;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace proj.db;

[Table("place")]


public class Place
{
    [Key]
    public string Id { get; set; } //= Nanoid.Generate();
    public string Name { get; set; }

    public string Description { get; set; } //= "";

    public float Lat { get; set; }

    public float Lon { get; set; }



    public List<Photo> Photos { get; set; }


}




