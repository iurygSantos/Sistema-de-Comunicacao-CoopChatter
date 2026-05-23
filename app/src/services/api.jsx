// Importa o axios
import axios from "axios";

// Cria uma instância do axios
const api = axios.create({
    baseURL: "http://localhost:5268", // URL do seu backend
    withCredentials: true, // Envia cookies
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
    // Pega token do localStorage
    const token = localStorage.getItem("token");

    // Se existir, adiciona no header
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) 
        {
            /*SESSÃO INVALIDA*/ 
            window.location.href = "/login"; // Redireciona para login
        }
        
        return Promise.reject(error);
    }
);

export default api;