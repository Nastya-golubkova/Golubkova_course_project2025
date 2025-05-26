using Microsoft.EntityFrameworkCore;

namespace proj.db;

public class MyDbContext : DbContext
{

    public DbSet<User> User { get; set; }
    public DbSet<Photo> Photo { get; set; }
    public DbSet<Place> Place { get; set; }
    public DbSet<PublicRoute> PublicRoute { get; set; }
    public DbSet<UserPlace> UserPlace { get; set; }


    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
    {            
    }

    
}
