import api from "../../services/api";
import { useEffect } from "react";
import ButtonLogout from "../components/ButtonLogout";


import { NavLink } from "react-router-dom"


import { HeaderContainer } from "./styles"
import { Scroll, Timer } from "@phosphor-icons/react"

export function Header() {
    return (
        <HeaderContainer>
            {/* <img src={logoUnicruz} alt="Logo Unicruz" /> */}

            <nav>
                <NavLink to="/" title="Timer" className="active">
                    <Timer size={24} />
                </NavLink>

                <NavLink to="/historico" title="Historico">
                    <Scroll size={24} />
                </NavLink>
            </nav>

        </HeaderContainer>

    )
}