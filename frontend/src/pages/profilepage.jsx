import React from 'react';
import Siderbar from '../components/siderbar.jsx';
import CardProfil from '../components/cardProfil.jsx';
import { useNavigate } from 'react-router-dom'; // Import du hook useNavigate pour la navigation
import { AppContext } from '../context/AppContext.jsx'; // Import du contexte pour la gestion de l'état global
import { useEffect,useState,useContext } from 'react';
import {Tabs,Tab,Container,Spinner} from "react-bootstrap"
import { toast } from "react-toastify";
import axios from 'axios';
import ProfileInfoTab from './profileInfoTab.jsx';
import OrganismeInfoTab from './organismeInfoTab.jsx';
import PasswordTab from './passwordTab.jsx';
import SiderbarAdmin from '../components/siderbarAdmin.jsx';
import SiderbarEval from '../components/siderbarEval.jsx';




function Profilepage({}) {
    const navigate = useNavigate(); // Hook pour la navigation  
    const[user,setUser] = useState(null); // État pour stocker les informations de l'utilisateur
    const {backendUrl, userData} = useContext(AppContext); // Récupération de l'URL du backend depuis le contexte
    const[loading,setLoading] = useState(true); // État pour indiquer si les données sont en cours de chargement

    /*if (!userData) {
  return <Spinner animation="border" className="mt-5" />;
}*/

    useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (!userData?.id){
          setLoading(false);
          return;} // safety check
        const response = await axios.get(`${backendUrl}/users/${userData?.id}`,{ withCredentials: true });
        setUser(response.data);
      } catch (error) {
        toast.error("Erreur chargement profil");
      } finally {
        setLoading(false);
      }
    };
     console.log("UserData Context =", userData);
      console.log("UserData ID =", userData?.id);

    if (userData?.id) fetchInfo();
  }, [backendUrl,userData]);

  /*if (!userData || loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }*/
  const SidebarComponent =
        user?.role === "ADMIN"
            ? SiderbarAdmin
            : user?.role === "EVALUATEUR"
            ? SiderbarEval
            : Siderbar;  
    //spinner
 /* if (loading) return (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: 16,
    background: "#f8f9fc",
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: "3px solid #e2e8f0",
      borderTop: "3px solid #6366f1",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
      Chargement...
    </p>*/

    {/*Required for the spin animation to work */}
   /* <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

  if ((user && user.etat !== "actif") || !user) {
  return (
    <>
      <Siderbar />
      <div style={{ marginLeft: "200px", padding: "40px" }}>
        <h2 style={{ color: "#ef4444" }}>Accès refusé</h2>
        <p>Votre compte est inactif. Vous ne pouvez pas accéder aux évaluations.</p>
      </div>
    </>
  );
}*/
    return (
      <>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ width: 300 }}>
        <SidebarComponent/>
      </div>
      
        
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", marginRight: "50px",
      padding: "1.5rem 0", fontFamily: "var(--font-sans, sans-serif)", width: "100%" }}>
        {/*HEADER */}
      <div  style={{ marginBottom:22 }}>
          <div style={{ fontSize:"1.2rem", fontWeight:800 }}>Mon Profil</div>
          <CardProfil user={user}/>
      </div>
      
       <div className="d-flex min-vh-100">
      


    {/* Main Content */}
    <div className="flex-grow-1 p-4">
      <Tabs defaultActiveKey="info" className="mb-3">
        <Tab eventKey="info" title="Informations Personelles">
          <ProfileInfoTab user={user} />
        </Tab>
        <Tab eventKey="infoOrganisme" title="Informations sur l'Organisme">
          {user?.organisme ? (
            <OrganismeInfoTab org={user.organisme} />
            ) : (
            <p>Chargement des informations de l'organisme...</p>
  )}
        </Tab>
        <Tab eventKey="password" title="Mot de Passe">
          <PasswordTab user={user} />
        </Tab>
      </Tabs>
    </div>
  </div>
  </div>
  <div/>
  </div>
  </>
);
}

export default Profilepage;