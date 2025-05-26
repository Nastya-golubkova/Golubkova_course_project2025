using NanoidDotNet;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace proj.db;

[Table("user")]
public class User
{
    [Key]
    public string Id { get; set; } = Nanoid.Generate();
    public string Name { get; set; }

    public string Email { get; set; }

    public string Password { get; set; }


    public List<Photo> Photos { get; set; }
  

}
