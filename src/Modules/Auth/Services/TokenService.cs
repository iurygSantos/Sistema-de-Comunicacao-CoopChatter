using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;


public class TokenService
{

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_123_SUPER_SECRET_KEY_123_SUPER_SECRET_KEY_123"));

        //Credenciais de assinatura (tipo de criptografia)
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Cria claims (dados dentro do token)
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
            new Claim(ClaimTypes.Name, user.name),
            new Claim("username", user.username)
        };

        // Cria token
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(1), // curta duração
            signingCredentials: creds   
        );

        // Retorna token em string
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}