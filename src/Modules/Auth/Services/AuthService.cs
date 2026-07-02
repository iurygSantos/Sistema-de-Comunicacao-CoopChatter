using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

public class AuthService
{
    private readonly AppDbContext _context;
    public AuthService(AppDbContext context)
    {
        _context = context;
    }
    // Método para registrar usuário
    public string HashPassword(string password)
    {
        // Gera hash seguro da senha
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    // Verifica senha
    public bool VerifyPassword(string password, string hash)
    {

        // Compara senha com hash armazenado
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public async Task<User> GetUser(string username)
    {
        // Busca usuário por email
        return await _context.usuario.FirstOrDefaultAsync(u => u.username == username);
    }
}



