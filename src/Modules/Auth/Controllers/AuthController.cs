using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Net;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;
    private readonly TokenService _tokenService;

    // Injeção de dependência
    public AuthController(AppDbContext context, AuthService authService, TokenService tokenService)
    {
        _context = context;
        _authService = authService;
        _tokenService = tokenService;
    }

    // Registro de usuário
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Verifica se email já existe
        if (await _context.Usuario.AnyAsync(u => u.username == dto.Username))
            return BadRequest("Email já cadastrado");

        // Cria usuário
        var user = new User
        {
            name        = dto.Name,
            username    = dto.Username,
            password    = _authService.HashPassword(dto.Password)
        };

        // Salva no banco
        _context.Usuario.Add(user);
        await _context.SaveChangesAsync();

        return Ok();
    }

/*============================================================================================================*/

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _authService.GetUser(dto.Username);

        // Verifica usuário
        if (user == null)
            return Unauthorized("Usuário não encontrado");

        // Verifica senha
        if (!_authService.VerifyPassword(dto.Password, user.password))
            return Unauthorized("Senha inválida");

        // Gera token
        var token = _tokenService.GenerateToken(user);
        
        /*CRIA COOKIE HTTP ONLY*/
        Response.Cookies.Append("token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Em desenvolvimento (HTTP), Secure deve ser "false". Em produção (HTTPS), "true".
            SameSite = SameSiteMode.Lax,     // Use Lax ou None para permitir o envio entre portas diferentes no localhost - se for porta igual usar "Strict"
            Expires = DateTime.UtcNow.AddHours(1) // Expira em 1 hora
        });

        return Ok(new { message = "Login realizado" });
    }

/*============================================================================================================*/

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("token", new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // true em produção (HTTPS)
            SameSite = SameSiteMode.Lax
        });

        return Ok(new { message = "Logout realizado com sucesso" });
    }

/*============================================================================================================*/
    [HttpGet("messages/{userId}")]
    // public async Task<IActionResult> GetMessages(string userId)
    // {
    //     var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    //     var messages = await _context.Messages
    //         .Where(m =>
    //             (m.From == currentUserId && m.To == userId) ||
    //             (m.From == userId && m.To == currentUserId))
    //         .OrderBy(m => m.CreatedAt)
    //         .ToListAsync();

    //     return Ok(messages);
    // }

/*============================================================================================================*/


    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try 
        {
            var userIdClaim     = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            // var nameClaim       = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;
            // var usernameClaim   = HttpContext.User.FindFirst("username")?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId)) 
                // Se o ID não for encontrado ou não for um inteiro válido, é um token inválido
                return Unauthorized("ID de usuário inválido no token.");

            var user = await _context.Usuario.FindAsync(userId);

            if (user == null) 
                return NotFound("Usuário não encontrado no sistema.");


            return Ok(new { 
                idUser      = user.id,
                nome        = user.name,
                username    = user.username
            });
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);
        }
    }
}