// Importa EF Core
using Microsoft.EntityFrameworkCore;

// Classe principal de acesso ao banco
public class AppDbContext : DbContext
{
    // Construtor recebe configuração do ASP.NET
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {

    }

    // Tabela de usuários
    public DbSet<User> usuarios { get; set; }
}