// Importa o axios
import axios from "axios";

// Cria uma instância do axios
const api = axios.create({
    baseURL: "http://localhost:5268", // URL do seu backend
    withCredentials: true, // Envia cookies
});

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) 
//         {
//             console.log("Sessão inválida. Redirecionando para login...");
            
//             /*SESSÃO INVALIDA*/ 
//             window.location.href = "/login"; // Redireciona para login
//         }
        
//         return Promise.reject(error);
//     }
// );

export default api;