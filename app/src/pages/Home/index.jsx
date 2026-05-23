import api from "../../services/api";
import { useEffect } from "react";
import ButtonLogout from "../components/ButtonLogout";

function Home() 
{

    return (
        <div>

            {/* <button onClick={handleMe}>Testar /me</button> */}
            <ButtonLogout />
        </div>

    );
}

export default Home;