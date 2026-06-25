using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configura banco PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql("Host=127.0.0.1;Database=coopchat;Username=postgres;Password=123456")
);

// Configura autenticação com JWT
builder.Services.AddAuthentication(options =>
{
    // Define o tipo padrão de autenticação
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Define como o token será validado
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // não valida quem emitiu (simplificado)
        ValidateAudience = false, // não valida público (simplificado)
        ValidateLifetime = true, // valida se o token expirou
        ValidateIssuerSigningKey = true, // valida assinatura

        // Chave usada para validar o token (tem que ser a mesma usada pra gerar)
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

    /*PEGA TOKEN DO COOKIE PARA USAR NO SIGNALR*/
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["token"];

            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }

            return Task.CompletedTask;
        }
    }; 

});

// Injeta serviços
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Permite que o Swagger descubra os endpoints automaticamente
builder.Services.AddEndpointsApiExplorer();

// Configura o Swagger (gera documentação da API)
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Digite: Bearer {seu token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    // Define informações básicas da API
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CoopChat API", // Nome da API
        Version = "v1", // Versão
        Description = "API do sistema de chat da cooperativa"
    });
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // frontend
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // permite cookies (para JWT no cookie)
    });
});

var app = builder.Build();
app.UseCors("AllowFrontend");

// Só ativa Swagger em ambiente de desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();      // Gera o JSON da documentação
    app.UseSwaggerUI();    // Interface visual no navegador
}

// Redireciona HTTP -> HTTPS
// app.UseHttpsRedirection();

// Habilita autenticação (vamos usar depois com JWT)
app.UseAuthentication();

// Habilita autorização
app.UseAuthorization();

// Mapeia os SignalR Hubs
app.MapHub<Chat>("/chat"); // Rota para o SignalR Hub de chat

// Mapeia os controllers (rotas)
app.MapControllers();
app.Run();