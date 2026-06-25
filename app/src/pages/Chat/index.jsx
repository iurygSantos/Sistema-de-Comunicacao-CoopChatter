import api from "../../services/api";
import ButtonLogout from "../components/ButtonLogout";

import { useState, useEffect } from "react";
import { connection } from "../../services/signalR";
import { HubConnectionState } from "@microsoft/signalr";

function Chat() 
{
    /* ESTADO DO USUARIO ONLINE */
    const [users, setUsers] = useState([]);     
    
    /**ESTADO DO USUARIO SELECIONA */
    const [selectedUser, setSelectedUser] = useState(null);

    /*RECEBE CONEXÃO PARA TROCA DE MENSAGENS DE USUARIOS*/
    useEffect(() => 
    {

        const startConnection = async () =>
        {
            try 
            {
                connection.on("ReceiveMessage", (fromUserId, message) => {
                    console.log("Mensagem recebida:", fromUserId, message);
                });
            
                // Listener de usuários online (ÚNICO!)
                connection.on("UsersOnline", (usersList) => 
                {
                    console.log("Usuários online:", usersList);
                    setUsers(usersList); //  atualiza estado
                });


                await connection.start();

                console.log("Conexão SignalR iniciada com sucesso.");
            }
            catch (error)
            {
                console.error("Erro ao iniciar a conexão:", error);
            }
        }

        startConnection();

        return () => {
            connection.off("ReceiveMessage");
            connection.off("UsersOnline");
        };

    }, []);


    const SendPrivateMessage = async () =>
    {
        if (!selectedUser)
        {
            console.log("Nenhum usuário selecionado.");
            return;
        }

        if (connection.state === HubConnectionState.Connected) 
        {
            await connection.invoke("SendPrivateMessage", selectedUser, "Olá do cliente!");
        }
    }

    const getUsers = async () => 
    {
        const response = await api.get("/me");

        console.log("teste" + response.data.nome);

        return response;
    };

    return (
        <div>
            <h1> {} </h1>
            <button onClick={SendPrivateMessage}> Enviar Mensagem privada </button>

            <ul>
                {users.map((userId) => (
                    <li key={userId}>
                        <button onClick={() => setSelectedUser(userId)}>
                            Conversar com {userId}
                        </button>
                    </li>
                ))}
            </ul>

            {/* <button onClick={handleMe}>Testar /me</button> */}
            <ButtonLogout />
        </div>

    );
}

export default Chat;