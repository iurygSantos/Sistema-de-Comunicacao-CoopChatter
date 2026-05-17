using BCrypt.Net;

// Serviço responsável por autenticação
public class AuthService
{
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
}