import api from "../../services/api";
import ButtonLogout from "../components/ButtonLogout";

import { useState, useEffect, useRef } from "react";
import { connection } from "../../services/signalR";
import { HubConnectionState } from "@microsoft/signalr";

function Chat() 
{
    // Estado para armazenar a lista de usuários online recebida do SignalR
    const [onlineUsers, setOnlineUsers] = useState([]);     
    
    // Estado para armazenar os dados do usuário logado (obtidos do backend via /auth/me)
    const [loggedInUser, setLoggedInUser] = useState(null);
    
    // Estado para armazenar o ID do usuário com quem o usuário logado deseja conversar
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Estado para armazenar o objeto completo do usuário selecionado para facilitar a exibição do nome
    const [selectedUser, setSelectedUser] = useState(null);

    // Estado para armazenar as mensagens da conversa atual com o usuário selecionado
    // Cada mensagem pode ser um objeto { from: userId, text: "mensagem" }
    const [messages, setMessages] = useState([]);

    // Estado para armazenar o texto que o usuário está digitando na caixa de mensagem
    const [messageInput, setMessageInput] = useState("");

    // Ref para rolar automaticamente para o final da lista de mensagens
    const messagesEndRef = useRef(null);

    /**
     * useEffect para carregar os dados do usuário logado quando o componente é montado.
     * Este efeito roda apenas uma vez (devido ao array de dependências vazio `[]`).
     * Ele faz uma requisição ao endpoint `/auth/me` do backend para obter as informações do usuário.
     */
    useEffect(() => 
    {
        const fetchLoggedInUser = async () => {
            try {
                const response = await api.get("/auth/me");

                // Assume que a resposta contém { idUser, nome, username }
                setLoggedInUser(response.data);

                // console.log("Dados do usuário logado carregados:", response.data);
            } 
            catch (error) {
                console.error("Erro ao buscar dados do usuário logado:", error);
                // O interceptor do Axios já deve redirecionar para o login em caso de 401
            }
        };

        fetchLoggedInUser();
    }, []); // Array vazio: executa apenas na montagem do componente

    /**
     * useEffect para iniciar e gerenciar a conexão SignalR.
     * Este efeito é re-executado se `loggedInUser` mudar (para aplicar o filtro de usuários online).
     * Ele configura os listeners para `ReceiveMessage` e `UsersOnline` e inicia a conexão.
     * A função de retorno (`return () => {...}`) é a função de limpeza, que desregistra os listeners
     * quando o componente é desmontado ou antes de uma nova execução do efeito.
     */
    useEffect(() => 
    {
        const startSignalRConnection = async () =>
        {
            try 
            {
                // Desregistra listeners antigos antes de registrar novos para evitar duplicação
                connection.off("ReceivePrivateMessage");
                connection.off("UsersOnline");

                // Listener para receber mensagens privadas
                // fromUserId: ID do remetente da mensagem
                // message: Conteúdo da mensagem
                connection.on("ReceivePrivateMessage", (messagePayload) => 
                {
                    // console.log(`[SignalR] Mensagem recebida de ${fromUserId}: `, messagePayload);

                    // fromUserId é o primeiro argumento do SendAsync do backend
                    const aFromUserId    = messagePayload.from; // O ID de quem realmente enviou
                    const aToUserId      = messagePayload.to;     // O ID para quem a mensagem foi enviada
                    const messageText   = messagePayload.message;      // O texto da mensagem

                    setMessages(prevMessages => 
                    {
                        // Verifica se a mensagem é para o chat ativo (com o selectedUserId)
                        // ou se é uma mensagem do próprio usuário logado para o usuário selecionado
                        // (assumindo que o backend envia \'toUserId\' na mensagem para o remetente)
                        if (selectedUserId && 
                            (String(aFromUserId) === String(selectedUserId) || 
                            (loggedInUser && String(aFromUserId) === String(loggedInUser.idUser) && 
                            String(aToUserId) === String(selectedUserId)))) 
                        {
                            return [...prevMessages, { from: aFromUserId, to: aToUserId, message: messageText }];
                        }
                        return prevMessages; 
                    });
                });
            
                // Listener para receber a lista de usuários online
                // usersList: Array de IDs de usuários online
                connection.on("UsersOnline", (usersList) => 
                {
                    console.log("[SignalR] Lista de usuários online recebida (RAW):", usersList);

                    // Filtra a lista para não incluir o próprio usuário logado, se loggedInUser estiver disponível
                    if (loggedInUser && loggedInUser.idUser) 
                    {
                        // Garante que os IDs são do mesmo tipo para a comparação
                        const filteredUsers = usersList.filter(user => String(user.id) !== String(loggedInUser.idUser));

                        setOnlineUsers(filteredUsers); 

                        // console.log("[SignalR] Usuários online filtrados (sem você):", filteredUsers);
                    } 
                    else 
                    {
                        // Se loggedInUser ainda não está disponível, armazena a lista bruta
                        // e ela será filtrada na próxima vez que loggedInUser for atualizado
                        setOnlineUsers(usersList); 

                        console.log("[SignalR] loggedInUser.idUser não disponível, armazenando lista RAW.", usersList);
                    }
                });

                // Inicia a conexão SignalR se ainda não estiver conectada
                if (connection.state === HubConnectionState.Disconnected) 
                {
                    await connection.start();
                    // console.log("Conexão SignalR iniciada com sucesso.");
                } 
                // else {
                //     console.log("Conexão SignalR já está ativa.");
                // }
            }
            catch (error)
            {
                console.error("Erro ao iniciar a conexão SignalR:", error);
            }
        }

        // Inicia a conexão SignalR. O filtro de usuários online será aplicado
        // assim que loggedInUser estiver disponível.
        startSignalRConnection();

        // Função de limpeza: desregistra os listeners quando o componente é desmontado
        // ou antes de uma nova execução do useEffect (se as dependências mudarem)
        return () => {
            connection.off("ReceivePrivateMessage");
            connection.off("UsersOnline");

            // Opcional: parar a conexão se este componente for o único a usá-la
            // if (connection.state === HubConnectionState.Connected) {
            //     connection.stop();
            //     console.log("Conexão SignalR parada.");
            // }
        };
    }, [loggedInUser, selectedUserId]); // loggedInUser para filtrar usuários online, selectedUserId para ReceiveMessage

    /**
     * useEffect para rolar a lista de mensagens para o final automaticamente
     * sempre que novas mensagens são adicionadas ao estado `messages`.
     */
    useEffect(() => 
    {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    /**
     * Função para enviar uma mensagem privada para o usuário selecionado.
     * Verifica se há um usuário selecionado e se a conexão SignalR está ativa.
     */
    const SendPrivateMessage = async () =>
    {
        if (!selectedUserId) {
            alert("Por favor, selecione um usuário para conversar.");
            return;
        }

        if (messageInput.trim() === "") {
            alert("A mensagem não pode ser vazia.");
            return;
        }

        if (connection.state === HubConnectionState.Connected) 
        {
            try 
            {
                // Invoca o método "SendPrivateMessage" no Hub do SignalR
                // Passa o ID do destinatário e o texto da mensagem
                // O backend agora espera um objeto com { from, to, text } para roteamento
                const messagePayload = 
                { 
                    from    : String(loggedInUser.idUser), 
                    to      : String(selectedUserId), 
                    message : messageInput 

                };

                // console.log(JSON.stringify(messagePayload));

                // console.log("\nORIGEM = " + messagePayload.from);
                // console.log("\nESTINO = " + messagePayload.to);
                // console.log("\nMESSAGE = " + messagePayload.message);

                await connection.invoke("SendPrivateMessage", messagePayload);

                // console.log(`Mensagem enviada para ${selectedUserId}: ${messagePayload}`);
                
                // Adiciona a mensagem enviada à lista de mensagens da conversa atual
                // Certifique-se de que loggedInUser.idUser é o ID correto do remetente
                // setMessages(prevMessages => [...prevMessages, { from: messagePayload.from, to: messagePayload.to, message: messagePayload.message }]);
                
                setMessageInput(""); // Limpa o campo de input após enviar
            } 
            catch (error) 
            {
                console.error("Erro ao enviar mensagem privada:", error);
                alert("Erro ao enviar mensagem.");
            }
        } 
        else 
        {
            alert("Conexão com o chat não está ativa. Tente novamente.");
        }
    }

    /**
     * Função para lidar com a seleção de um usuário na lista de online.
     * Quando um usuário é selecionado, redefine as mensagens para uma nova conversa.
     * @param {object} user - O objeto completo do usuário selecionado ({ Id, Name, Username }).
     */
    const handleUserSelect = (user) => 
    {
        console.log(selectedUserId)
        console.log(selectedUser)

        if (selectedUserId !== user.id)
        {
            setSelectedUserId(user.id); // Armazena o ID para envio de mensagens
            setSelectedUser(user); // Armazena o objeto completo para exibição
        
            setMessages([]); // Limpa as mensagens ao selecionar um novo usuário
        }

        // console.log(`Usuário selecionado: ${user.name} (ID: ${user.id})`);
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Coluna da esquerda: Usuários Online */}
            <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
                {/* <h2>Usuários Online</h2> */}
                {loggedInUser ? (
                    <p> {loggedInUser.nome} </p>
                    
                ) : (
                    <p>Carregando dados do usuário...</p>
                )}
                <ButtonLogout />
                
                <hr />

                <h3>Usuários online:</h3>
                <ul>
                    {onlineUsers.length === 0 ? (
                        <li>Nenhum usuário online.</li>
                    ) : (
                        onlineUsers.map((user) => (
                            <li key={user.id} style={{ marginBottom: '5px' }}>
                                <button 
                                    onClick={() => handleUserSelect(user)}
                                    style={{
                                        fontWeight: selectedUserId === user.id ? 'bold' : 'normal',
                                        backgroundColor: selectedUserId === user.id ? '#a3bb9a65' : 'tranparent',
                                        border: 'none',
                                        padding: '5px',
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {user.name} {/* Idealmente, você teria o nome/username aqui */}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Coluna da direita: Área de Chat */}
            <div style={{ flexGrow: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                {selectedUser ? (
                    <>
                        <h2> {selectedUser?.name} </h2>
                        {/* Área de exibição de mensagens */}
                        <div style={{ flexGrow: 1, border: '1px solid #eee', padding: '10px', overflowY: 'auto', marginBottom: '10px' }}>

                            {
                                messages.length === 0 ? (
                                    <p>Nenhuma mensagem nesta conversa.</p>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMine = String(msg.from) === String(loggedInUser?.idUser);

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    textAlign: isMine ? 'right' : 'left',
                                                    margin: '5px 0'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        backgroundColor: isMine ? '#dcf8c6' : '#f1f0f0',
                                                        padding: '8px 12px',
                                                        borderRadius: '15px',
                                                        display: 'inline-block',
                                                        maxWidth: '70%'
                                                    }}
                                                >
                                                    {msg.message}
                                                </span>
                                            </div>
                                        );
                                    })
                                )
                            }
                            <div ref={messagesEndRef} /> {/* Elemento para rolagem automática */}
                        </div>

                        {/* Área de input de mensagem */}
                        <div style={{ display: 'flex' }}>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                style={{ flexGrow: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '5px', marginRight: '10px' }}
                                onKeyPress={(e) => { if (e.key === 'Enter') SendPrivateMessage(); }} onfocus="this.selectionStart = thsi.selectionEnd"
                            />
                            <button 
                                onClick={SendPrivateMessage}
                                style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} 
                            >
                                Enviar
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Selecione um usuário para iniciar uma conversa.</p>
                )}
            </div>
        </div>
    );
}

export default Chat;