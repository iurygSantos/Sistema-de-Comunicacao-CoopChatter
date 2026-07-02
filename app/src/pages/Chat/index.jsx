import api from "../../services/api";
import ButtonLogout from "../components/ButtonLogout";
import styles from "./styles.ts";

import { useState, useEffect, useRef } from "react";
import { connection } from "../../services/signalR";
import { HubConnectionState } from "@microsoft/signalr";

const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("");

const formatTime = (date) =>
    new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });


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

    const [loadingHistorico, setLoadingHistorico] = useState(false);
    

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

    useEffect(() => 
    {
        if (!selectedUserId) return;

        const fetchHistorico = async () => 
        {
            setLoadingHistorico(true);
            try 
            {
                const response = await api.get(`/mensagens/historico/${selectedUserId}`);
                const historico = response.data.map(m => ({
                    from: m.remetenteId,
                    to: String(m.remetenteId) === String(selectedUserId) ? loggedInUser?.idUser : selectedUserId,
                    message: m.conteudo,
                    time: new Date(m.dataCriacao),
                }));
                setMessages(historico);
            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
                setMessages([]);
            } finally {
                setLoadingHistorico(false);
            }
        };

        fetchHistorico();
    }, [selectedUserId, loggedInUser]);

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

                await connection.invoke("SendPrivateMessage", messagePayload);

                // console.log(`Mensagem enviada para ${selectedUserId}: ${messagePayload}`);                
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
        // console.log(selectedUserId)
        // console.log(selectedUser)

        if (selectedUserId !== user.id)
        {
            setSelectedUserId(user.id); // Armazena o ID para envio de mensagens
            setSelectedUser(user); // Armazena o objeto completo para exibição
        
            setMessages([]); // Limpa as mensagens ao selecionar um novo usuário
        }

        // console.log(`Usuário selecionado: ${user.name} (ID: ${user.id})`);
    };

    return (
        <div style={styles.root}>

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.userInfo}>
                        <div style={styles.avatar}>
                            {loggedInUser ? getInitials(loggedInUser.nome) : "?"}
                        </div>
                        <div>
                            <div style={styles.userName}>
                                {loggedInUser ? loggedInUser.nome : "Carregando..."}
                            </div>
                            {loggedInUser && (
                                <div style={styles.userUsername}>{loggedInUser.username}</div>
                            )}
                        </div>
                    </div>
                    <ButtonLogout style={styles.logoutBtn} />
                </div>

                <div style={styles.sidebarSection}>Online agora</div>
                <div style={styles.userList}>
                    {onlineUsers.length === 0 ? (
                        <div style={styles.emptyList}>Nenhum usuário online.</div>
                    ) : (
                        onlineUsers.map((user) => (
                            <div
                                key={user.id}
                                style={styles.userItem(selectedUserId === user.id)}
                                onClick={() => handleUserSelect(user)}
                                onMouseEnter={(e) => { if (selectedUserId !== user.id) e.currentTarget.style.backgroundColor = "#1A2B3C"; }}
                                onMouseLeave={(e) => { if (selectedUserId !== user.id) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                                <div style={styles.onlineDot} />
                                <span style={styles.userItemName(selectedUserId === user.id)}>
                                    {user.name}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Área principal */}
            <div style={styles.main}>
                {selectedUser ? (
                    <>
                        <div style={styles.chatHeader}>
                            <div style={styles.chatAvatar}>
                                {getInitials(selectedUser.name)}
                            </div>
                            <div>
                                <div style={styles.chatName}>{selectedUser.name}</div>
                                <div style={styles.chatStatus}>● online</div>
                            </div>
                        </div>

                        <div style={styles.messages}>
                            {loadingHistorico ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptySubtitle}>Carregando mensagens...</div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A78" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                    </div>
                                    <div style={styles.emptyTitle}>Nenhuma mensagem hoje.</div>
                                    <div style={styles.emptySubtitle}>Diga olá para {selectedUser.name}!</div>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMine = String(msg.from) === String(loggedInUser?.idUser);
                                    return (
                                        <div key={index} style={styles.msgWrapper(isMine)}>
                                            <div style={styles.bubble(isMine)}>
                                                {msg.message}
                                            </div>
                                            {msg.time && (
                                                <span style={styles.msgTime}>
                                                    {formatTime(msg.time)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={styles.inputArea}>
                            <input
                                style={styles.textInput}
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") SendPrivateMessage(); }}
                                placeholder={`Mensagem para ${selectedUser.name}...`}
                            />
                            <button
                                style={styles.sendBtn(!messageInput.trim())}
                                onClick={SendPrivateMessage}
                                disabled={!messageInput.trim()}
                                aria-label="Enviar mensagem"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22,2 15,22 11,13 2,9"/>
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D5A78" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div style={styles.emptyTitle}>Selecione um usuário para conversar.</div>
                        <div style={styles.emptySubtitle}>Os usuários online aparecem na lista à esquerda.</div>
                    </div>
                )}
            </div>
        </div>
    );
    // return (
    //     <div style={{ display: 'flex', height: '100vh' }}>
    //         {/* Coluna da esquerda: Usuários Online */}
    //         <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
    //             {/* <h2>Usuários Online</h2> */}
    //             {loggedInUser ? (
    //                 <p> {loggedInUser.nome} </p>
                    
    //             ) : (
    //                 <p>Carregando dados do usuário...</p>
    //             )}
    //             <ButtonLogout />
                
    //             <hr />

    //             <h3>Usuários online:</h3>
    //             <ul>
    //                 {onlineUsers.length === 0 ? (
    //                     <li>Nenhum usuário online.</li>
    //                 ) : (
    //                     onlineUsers.map((user) => (
    //                         <li key={user.id} style={{ marginBottom: '5px' }}>
    //                             <button 
    //                                 onClick={() => handleUserSelect(user)}
    //                                 style={{
    //                                     fontWeight: selectedUserId === user.id ? 'bold' : 'normal',
    //                                     backgroundColor: selectedUserId === user.id ? '#a3bb9a65' : 'tranparent',
    //                                     border: 'none',
    //                                     padding: '5px',
    //                                     width: '100%',
    //                                     textAlign: 'left',
    //                                     cursor: 'pointer'
    //                                 }}
    //                             >
    //                                 {user.name} {/* Idealmente, você teria o nome/username aqui */}
    //                             </button>
    //                         </li>
    //                     ))
    //                 )}
    //             </ul>
    //         </div>

    //         {/* Coluna da direita: Área de Chat */}
    //         <div style={{ flexGrow: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
    //             {selectedUser ? (
    //                 <>
    //                     <h2> {selectedUser?.name} </h2>
    //                     {/* Área de exibição de mensagens */}
    //                     <div style={{ flexGrow: 1, border: '1px solid #eee', padding: '10px', overflowY: 'auto', marginBottom: '10px' }}>

    //                         {
    //                             messages.length === 0 ? (
    //                                 <p>Nenhuma mensagem nesta conversa.</p>
    //                             ) : (
    //                                 messages.map((msg, index) => {
    //                                     const isMine = String(msg.from) === String(loggedInUser?.idUser);

    //                                     return (
    //                                         <div
    //                                             key={index}
    //                                             style={{
    //                                                 textAlign: isMine ? 'right' : 'left',
    //                                                 margin: '5px 0'
    //                                             }}
    //                                         >
    //                                             <span
    //                                                 style={{
    //                                                     backgroundColor: isMine ? '#dcf8c6' : '#f1f0f0',
    //                                                     padding: '8px 12px',
    //                                                     borderRadius: '15px',
    //                                                     display: 'inline-block',
    //                                                     maxWidth: '70%'
    //                                                 }}
    //                                             >
    //                                                 {msg.message}
    //                                             </span>
    //                                         </div>
    //                                     );
    //                                 })
    //                             )
    //                         }
    //                         <div ref={messagesEndRef} /> {/* Elemento para rolagem automática */}
    //                     </div>

    //                     {/* Área de input de mensagem */}
    //                     <div style={{ display: 'flex' }}>
    //                         <input
    //                             type="text"
    //                             value={messageInput}
    //                             onChange={(e) => setMessageInput(e.target.value)}
    //                             placeholder="Digite sua mensagem..."
    //                             style={{ flexGrow: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '5px', marginRight: '10px' }}
    //                             onKeyPress={(e) => { if (e.key === 'Enter') SendPrivateMessage(); }} onfocus="this.selectionStart = thsi.selectionEnd"
    //                         />
    //                         <button 
    //                             onClick={SendPrivateMessage}
    //                             style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} 
    //                         >
    //                             Enviar
    //                         </button>
    //                     </div>
    //                 </>
    //             ) : (
    //                 <p>Selecione um usuário para iniciar uma conversa.</p>
    //             )}
    //         </div>
    //     </div>
    // );
}

export default Chat;