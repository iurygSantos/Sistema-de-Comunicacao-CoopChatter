import * as signalR from "@microsoft/signalr";

// Cria conexão com backend
export const connection = new signalR.HubConnectionBuilder()
.withUrl("http://localhost:5268/chat", 
    {
        withCredentials: true // envia cookie
    })
    .withAutomaticReconnect()
    .build();