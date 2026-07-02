// Importa EF Core
using Microsoft.EntityFrameworkCore;

// Classe principal de acesso ao banco
public class AppDbContext : DbContext
{
    // Construtor recebe configuração do ASP.NET
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {

    }
    public DbSet<User> usuario { get; set; }

    // public DbSet<Conversa> Chat { get; set; }
    // public DbSet<Participante> Participante { get; set; }
    // public DbSet<Mensagem> Mensagem { get; set; }
    // public DbSet<StatusMensagem> StatusMensagen { get; set; }

    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     base.OnModelCreating(modelBuilder);
 
    //     // ---- Mapeamento explícito dos nomes de tabela (em minúsculo, como já existe no banco) ----
    //     modelBuilder.Entity<User>().ToTable("usuario");
    //     modelBuilder.Entity<ChatConversa>().ToTable("chat");
    //     modelBuilder.Entity<Participante>().ToTable("participantes");
    //     modelBuilder.Entity<Mensagem>().ToTable("mensagem");
    //     modelBuilder.Entity<StatusMensagem>().ToTable("status_mensagem");
 
    //     // ---- PK composta de Participante (chat_id, user_id) ----
    //     modelBuilder.Entity<Participante>()
    //         .HasKey(p => new { p.chat_id, p.user_id });
 
    //     // ---- Relacionamentos ----
 
    //     // ChatConversa 1:N Participante
    //     modelBuilder.Entity<Participante>()
    //         .HasOne(p => p.Chat)
    //         .WithMany(c => c.Participantes)
    //         .HasForeignKey(p => p.chat_id);
 
    //     // User 1:N Participante
    //     modelBuilder.Entity<Participante>()
    //         .HasOne(p => p.User)
    //         .WithMany()
    //         .HasForeignKey(p => p.user_id);
 
    //     // ChatConversa 1:N Mensagem
    //     modelBuilder.Entity<Mensagem>()
    //         .HasOne(m => m.Chat)
    //         .WithMany(c => c.Mensagens)
    //         .HasForeignKey(m => m.chat_id);
 
    //     // User (Remetente) 1:N Mensagem
    //     modelBuilder.Entity<Mensagem>()
    //         .HasOne(m => m.Remetente)
    //         .WithMany()
    //         .HasForeignKey(m => m.remetente_id)
    //         .OnDelete(DeleteBehavior.Restrict); // evita conflito de cascade múltiplo

    //     // Mensagem 1:N StatusMensagem
    //     modelBuilder.Entity<StatusMensagem>()
    //         .HasOne(s => s.Mensagem)
    //         .WithMany(m => m.StatusMensagens)
    //         .HasForeignKey(s => s.mensagem_id);

    //     // User 1:N StatusMensagem
    //     modelBuilder.Entity<StatusMensagem>()
    //         .HasOne(s => s.User)
    //         .WithMany()
    //         .HasForeignKey(s => s.user_id)
    //         .OnDelete(DeleteBehavior.Restrict); // evita conflito de cascade múltiplo
    // }
    
}