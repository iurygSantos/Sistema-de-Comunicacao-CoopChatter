using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

    // Login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // Busca usuário
        var user = await _context.usuarios.FirstOrDefaultAsync(u => u.username == dto.username);

        // Verifica usuário
        if (user == null)
            return Unauthorized("Usuário não encontrado");

        // Verifica senha
        if (!_authService.VerifyPassword(dto.password, user.password))
            return Unauthorized("Senha inválida");

        // Gera token
        var token = _tokenService.GenerateToken(user);

        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.usuarios.FindAsync(int.Parse(userId));

        if (user == null) return NotFound("Usuário não encontrado");

        return Ok(new { 
            id = user.id,
            name = user.name,
            username = user.username
        });
    }
}