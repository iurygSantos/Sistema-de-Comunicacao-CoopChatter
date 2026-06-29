using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

public class Chat : Hub
{
    private readonly AppDbContext _context; 
    private static readonly HashSet<string> ConnectedUsers = new HashSet<string>(); // Para IDs de conexão

    public Chat(AppDbContext context)
    {
        _context = context;
    }

    /*ARMAZENA USUARIOS ONLINE (USERID -> CONNECTIONID)*/
    private static Dictionary<string, List<string>> _connections = new();


    /*QUANDO ALGUEM CONECTA*/
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            ConnectedUsers.Add(userId); // Adiciona o ID do usuário logado
            await SendUsersOnlineList(); // Envia a lista atualizada
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            ConnectedUsers.Remove(userId); // Remove o ID do usuário
            await SendUsersOnlineList(); // Envia a lista atualizada
        }
        await base.OnDisconnectedAsync(exception);
    }
    
    // Método para enviar a lista de usuários online com detalhes
    public async Task SendUsersOnlineList()
    {
        // Pega os IDs dos usuários conectados
        var onlineUserIds = ConnectedUsers.ToList();

        // Busca os detalhes dos usuários no banco de dados
        // Assumindo que seu modelo de usuário tem propriedades Id, Nome e Username
        var usersDetails = await _context.usuarios
            .Where(u => onlineUserIds.Contains(u.id.ToString())) // Converte int para string para comparar
            .Select(u => new UserOnlineDto 
            { 
                Id = u.id.ToString(), 
                Name = u.name, 
                Username = u.username 
            })
            .ToListAsync();

        // Envia a lista de DTOs para todos os clientes conectados
        await Clients.All.SendAsync("UsersOnline", usersDetails.Select(u => new UserOnlineDto 
        { 
            Id = u.Id, 
            Name = u.Name, 
            Username = u.Username 
        }).ToList());
    }

    /*METODO CHAMA FRONTEND*/
    public async Task SendPrivateMessage(MessageDTO messageData)
    {        
        var senderUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(senderUserId))
        {
            // O usuário não está autenticado no SignalR
            return;
        }

        var messagePayload = new 
        { 
            from    = senderUserId, 
            to      = messageData.To, 
            message = messageData.Message 
        };

        // Envia a mensagem para o usuário específico (destinatário)
        // O SignalR usa o Context.UserIdentifier para mapear receiverUserId para as conexões ativas
        await Clients.User(messagePayload.to).SendAsync("ReceivePrivateMessage", messagePayload);
        
        // Opcional: Enviar a mensagem de volta para o remetente para que ele veja no seu próprio chat
        // Isso é importante para que o remetente veja a mensagem que acabou de enviar
        await Clients.Caller.SendAsync("ReceivePrivateMessage", messagePayload);
    }
}