import api from "../services/api";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// Componente que protege rotas
const PrivateRoute = ({ children }) => 
{
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth]   = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try 
            {
                await api.get("/auth/me", {}, {
                    withCredentials: true, // Envia cookies
                });

                setIsAuth(true);
            } 
            catch (error) {
                console.log("Verificação de erro - catch");
                setIsAuth(false);
            } 
            finally { 
                setLoading(false);
            }
        };

        checkAuth();
    }, []);
    

    if (loading) 
        return <div>Carregando...</div>;

    return isAuth ? children : <Navigate to="/login" />;
    
};

export default PrivateRoute;