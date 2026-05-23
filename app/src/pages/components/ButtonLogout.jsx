import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ButtonLogout() 
{
    const navigate = useNavigate();

    const handleLogout = async () => {
        try 
        {
            await api.post("/auth/logout", {}, {
                withCredentials: true, // Envia cookies
            });

            // window.location.href = "/login";
            navigate("/login");
        }
        catch (error) 
        {
            console.error(error);
            alert("Erro ao fazer logout");
        }

    };

    return (
        <button onClick={handleLogout}> Deslogar </button>
    );
}

export default ButtonLogout;
