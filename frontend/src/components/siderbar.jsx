import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import "bootstrap/dist/css/bootstrap.min.css";



function Siderbar(){
    const navigate = useNavigate();
    const {isloggedIn,setIsloggedIn} = React.useContext(AppContext);
    const {userData} = React.useContext(AppContext);

    const handleLogout = () => {
        setIsloggedIn(false);
        navigate("/Login"); // Redirection vers la page de connexion après la déconnexion
    };
    return(
        <>
        <div className="bg-dark text-white vh-100 p-3 position-fixed" 
        style={{ width:150, background:"#0f0f13", display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#fff" }}>SSE</div>

            <nav className="nav flex-column gap-2" 
            style={{ flex:1, padding:"14px 0", display:"flex", flexDirection:"column", gap:2 }}>
                <Link className="nav-link text-white rounded hover-bg-secondary" to="/homepage">
                Home
                </Link>

                {userData?.role=="ADMIN" &&(
                    <Link className="nav-link text-white rounded hover-bg-secondary" to="/">
                        utilisateurs
                    </Link>
                )}

                <Link className="nav-link text-white rounded hover-bg-secondary" to="/profilepage">
                Profile
                </Link>
                {userData?.role=="ADMIN" &&(
                    <Link className="nav-link text-white rounded hover-bg-secondary" to="/listDemandes">
                        liste demandes
                    </Link>
                )}
            </nav>
                    
            <button onClick={handleLogout} className="btn btn-danger w-100 mt-3">Logout</button>
                    

        </div>
        <style>
        {`
        .hover-bg-secondary{
            transition:0.3s ease;
        }

        .hover-bg-secondary:hover{
            background:#495057 !important;
            padding-left:12px;
        }
        `}
</style>
</>
    )
    

}
export default Siderbar;