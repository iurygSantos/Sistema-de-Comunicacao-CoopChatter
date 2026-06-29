import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    // Estado para armazenar usuário e senha
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Função chamada ao clicar no botão
    const handleLogin = async () => 
    {
        const data = {
            username: username,
            password: password,
        };

        try {
            // Pega token da resposta
            // const token = response.data.token;
            
            await api.post("/auth/login", data, {
                withCredentials: true, // Envia cookies
            });

            alert(`Bem vindo : ${username}`);
            
            navigate("/chat");

        }
        catch (error) 
        {
            console.error(error);
            alert("Erro ao fazer login");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            {/* Campo usuário */}
            <input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            {/* Campo senha */}
            <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* Botão login */}
            <button onClick={handleLogin}>Entrar</button>
        </div>

    );
}

export default Login;