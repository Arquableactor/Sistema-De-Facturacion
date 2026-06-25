using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // TODO: Add DbSet<> properties later.
}
