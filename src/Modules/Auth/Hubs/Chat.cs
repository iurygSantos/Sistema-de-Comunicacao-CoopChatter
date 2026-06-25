using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

public class Chat : Hub
{
    /*ARMAZENA USUARIOS ONLINE (USERID -> CONNECTIONID)*/
    private static Dictionary<string, List<string>> _connections = new();

    /*METODO CHAMA FRONTEND*/
    public async Task SendPrivateMessage(string toUserId, string message)
    {
        /*PEGANDO O ID DO USUÁRIO QUE ESTÁ ENVIANDO A MENSAGEM*/
        var fromUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (fromUserId == null)
        {
            throw new Exception("Usuário não autenticado.");
        }

        /*ENVIANDO A MENSAGEM PARA O USUÁRIO DESTINATÁRIO*/
        await Clients.User(toUserId).SendAsync("ReceivePrivateMessage", fromUserId, message);
    }

    /*QUANDO ALGUEM CONECTA*/
    public override async Task OnConnectedAsync()
    {
        // var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userId = Context.UserIdentifier;

        if (!_connections.ContainsKey(userId))
        {
            _connections[userId] = new List<string>();
        }

        _connections[userId].Add(Context.ConnectionId);
        
        /*ENVIA LISTA ATUALIZADA PARA TODOS*/

        await Clients.All.SendAsync("UsersOnline", _connections.Keys);

        Console.WriteLine(Context.User?.Identity?.IsAuthenticated);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;

        if (userId != null && _connections.ContainsKey(userId))
        {
            _connections[userId].Remove(Context.ConnectionId);

            if (_connections[userId].Count == 0)
            {
                _connections.Remove(userId);
            }
        }

        /*ENVIA LISTA ATUALIZADA PARA TODOS*/
        await Clients.All.SendAsync("UsersOnline", _connections.Keys);

        await base.OnDisconnectedAsync(exception);
    }
}