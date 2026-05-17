// Representa um usuário no banco
public class User
{
    public int id { get; set; } // ID único

    public string name { get; set; } = string.Empty; // Nome

    public string username { get; set; } = string.Empty; // Login

    public string password { get; set; } = string.Empty; // Senha criptografada
}