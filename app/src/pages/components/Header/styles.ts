// import styled from "styled-components"

export const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3rem;
    margin-top: 30px;
    margin-bottom: 30px;

    
    img {
        margin: 1rem;
    }

    nav
    {
        display: flex;
        gap: 0.5rem;
        margin-right: 20px;

        a {
            width: 3rem;
            height: 3rem;

            display: flex;
            justify-content: center;
            align-items: center;
            
            /* color: ${(props) => props.theme["gray-100"]}; */

            border-top: 3px solid transparent;
            border-bottom: 3px solid transparent;
            
            &:hover 
            {
                /* border-bottom: 3px solid ${(props) => props.theme["green-500"]}; */
            }
            
            &.active
            {
                /* color: ${(props) => props.theme["green-500"]}; */
            }
        }
    }

`