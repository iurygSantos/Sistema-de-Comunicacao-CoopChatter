// import api from "../../services/api";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "./styles.ts";


// function Login() {

//     const navigate = useNavigate();

//     // Estado para armazenar usuário e senha
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");

//     // Função chamada ao clicar no botão
//     const handleLogin = async () => 
//     {
//         const data = {
//             username: username,
//             password: password,
//         };

//         try {
//             // Pega token da resposta
//             // const token = response.data.token;
            
//             await api.post("/auth/login", data, {
//                 withCredentials: true, // Envia cookies
//             });

//             alert(`Bem vindo ${username}`);
            
//             navigate("/chat");

//         }
//         catch (error) 
//         {
//             console.error(error);
//             alert("Erro ao fazer login");
//         }
//     };

//     return (
//         <div>
//             <h2>Login</h2>

//             {/* Campo usuário */}
//             <input
//                 type="text"
//                 placeholder="Usuário"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//             />

//             {/* Campo senha */}
//             <input
//                 type="password"
//                 placeholder="Senha"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />

//             {/* Botão login */}
//             <button onClick={handleLogin}>Entrar</button>
//         </div>

//     );
// }

// export default Login;

import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import styles from "./styles.ts";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Foco nos inputs — muda a cor da borda inferior
    const handleFocus = (e) => {
        e.target.style.borderBottomColor = "#2E86FF";
    };
    const handleBlur = (e) => {
        e.target.style.borderBottomColor = "#2A3D52";
    };

    const handleLogin = async () => 
    {
        if (!username.trim() || !password.trim()) 
        {
            setError("Preencha usuário e senha.");
            return;
        }

        const data = {
            username: username,
            password: password,
        };

        setError("");
        setLoading(true);

        try {
            // Pega token da resposta
            // const token = response.data.token;
            
            await api.post("/auth/login", data, {
                withCredentials: true, // Envia cookies
            });

            alert(`Bem vindo ${username}`);
            
            navigate("/chat");
        } 
        catch (err) 
        {
            console.error(err);
                
            const status = err?.response?.status;

            if (status === 401) 
            {
                setError("Usuário ou senha incorretos.");
            } 
            else {
                setError("Não foi possível conectar. Tente novamente.");
            }
        } 
        finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    const isDisabled = loading || !username.trim() || !password.trim();

    return (
        <div style={styles.page}>
        <div style={styles.card}>

            {/* Marca */}
            <div style={styles.brand}>
            <div style={styles.brandIcon}>
                <div style={styles.brandIconInner} />
            </div>
            <span style={styles.brandName}>CoopChatter</span>
            </div>

            {/* Título */}
            <h1 style={styles.heading}>Bem-vindo de volta.</h1>
            <p style={styles.subheading}>Entre com suas credenciais para continuar.</p>

            {/* Campo usuário */}
            <div style={styles.fieldGroup}>
            <label style={styles.label}>Usuário</label>
            <input
                style={styles.input}
                type="text"
                placeholder="seu.usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoComplete="username"
                disabled={loading}
            />
            </div>

            {/* Campo senha */}
            <div style={styles.fieldGroup}>
            <label style={styles.label}>Senha</label>
            <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                disabled={loading}
            />
            </div>

            {/* Botão */}
            <button
            style={{ ...styles.button, ...(isDisabled ? styles.buttonDisabled : {}) }}
            onClick={handleLogin}
            disabled={isDisabled}
            onMouseEnter={(e) => { if (!isDisabled) e.target.style.backgroundColor = "#1a6fe0"; }}
            onMouseLeave={(e) => { if (!isDisabled) e.target.style.backgroundColor = "#2E86FF"; }}
            >
            {loading ? "Entrando..." : "Entrar"}
            </button>

            {/* Erro */}
            {error && <p style={styles.error}>{error}</p>}

            {/* Rodapé */}
            <div style={styles.footer}>
            Acesso restrito a colaboradores autorizados
            </div>
        </div>
        </div>
    );
}

export default Login;
