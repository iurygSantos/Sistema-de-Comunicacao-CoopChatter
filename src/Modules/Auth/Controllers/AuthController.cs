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
        if (await _context.usuarios.AnyAsync(u => u.username == dto.username))
            return BadRequest("Email já cadastrado");

        // Cria usuário
        var user = new User
        {
            name = dto.name,
            username = dto.username,
            password = _authService.HashPassword(dto.password)
        };

        // Salva no banco
        _context.usuarios.Add(user);
        await _context.SaveChangesAsync();

        return Ok();
    }

/*============================================================================================================*/

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _authService.GetUser(dto.username);

        // Verifica usuário
        if (user == null)
            return Unauthorized("Usuário não encontrado");

        // Verifica senha
        if (!_authService.VerifyPassword(dto.password, user.password))
            return Unauthorized("Senha inválida");

        // Gera token
        var token = _tokenService.GenerateToken(user);
        
        /*CRIA COOKIE HTTP ONLY*/
        Response.Cookies.Append("token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(5) // Expira em 5 minutos
        });

        return Ok(new { message = "Login realizado" });
    }

/*============================================================================================================*/

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
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


    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try 
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var user = await _context.usuarios.FindAsync(int.Parse(userId));

            if (user == null) 
                return NotFound("Usuário não encontrado");

            return Ok(new { 
                userId = user.id,
                name = user.name,
                username = user.username
            });
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);
        }
    }
}