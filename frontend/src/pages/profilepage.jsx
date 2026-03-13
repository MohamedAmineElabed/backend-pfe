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
import PasswordTab from './passwordTab.jsx';
import SiderbarAdmin from '../components/siderbarAdmin.jsx';




function Profilepage({}) {
    const navigate = useNavigate(); // Hook pour la navigation  
    const[user,setUser] = useState(null); // État pour stocker les informations de l'utilisateur
    const {backendUrl, userData} = useContext(AppContext); // Récupération de l'URL du backend depuis le contexte
    const SidebarComponent = userData.role === "ADMIN" ? SiderbarAdmin : Siderbar;
    const[loading,setLoading] = useState(false); // État pour indiquer si les données sont en cours de chargement

    if (!userData) {
  return <Spinner animation="border" className="mt-5" />;
}

    useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`${backendUrl}/users/${userData?.id}`);
        setUser(response.data);
      } catch (error) {
        toast.error("Erreur chargement profil");
      } finally {
        setLoading(false);
      }
    };
     console.log("UserData Context =", userData);
      console.log("UserData ID =", userData?.id);

    fetchInfo();
  }, [backendUrl,userData]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

        
    return (
      <>
      <div className="d-flex">
      
        <SidebarComponent/>
      <div className="flex-grow-1 p-4" style={{ marginLeft: "180px" }}>
        {/*HEADER */}
      <div  style={{ marginBottom:22 }}>
          <div style={{ fontSize:"1.2rem", fontWeight:800 }}>Mon Profil</div>
          <CardProfil user={user}/>
      </div>
      
       <div className="d-flex min-vh-100">
      


    {/* Main Content */}
    <div className="flex-grow-1 p-4">
      <Tabs defaultActiveKey="info" className="mb-3">
        <Tab eventKey="info" title="Informations">
          <ProfileInfoTab user={user} />
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