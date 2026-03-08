import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import Siderbar from "../../components/siderbar.jsx";

const ListDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const[isEmpty,setIsEmpty]=useState(true);
  const { backendUrl } = React.useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // État pour indiquer si une validation est en cours 
  const[isRefusing, setIsRefusing] = useState(false); // État pour indiquer si un refus est en cours

  // Fonction pour récupérer les demandes depuis le backend
  const fetchDemandes=async() =>{
    try{
        setLoading(true);
        const response = await axios.get(`${backendUrl}/demandes`);
        setDemandes(response.data);
        setIsEmpty(response.data.length === 0);

    }catch(err){
        toast.error("Erreur lors de la récupération des demandes");
    }finally{
        setLoading(false);
    }
  }

  // Utilisation de useEffect pour charger les demandes au montage du composant
  useEffect(() => {
    if(backendUrl)
        fetchDemandes();
  }, [backendUrl]);

  //valider demande
  const handleValider=async(id)=>{
    try{
        const response=await axios.put(`${backendUrl}/demandes/${id}/valider`);
        if(response.status===200){
            toast.success("Demande validée avec succès");
            fetchDemandes(); // Rafraîchir la liste après validation
        }
        else{
            toast.error("Erreur lors de la validation de la demande");
        }
    }catch(err){
        toast.error("Erreur lors de la validation de la demande");
    }
  }

  const handleRefuser=async(id)=>{
    try{
        const response=await axios.put(
            `${backendUrl}/demandes/${id}/refuser`
        );
        if(response.status===200){
            toast.success("Demande refusée avec succès");
            fetchDemandes(); // Rafraîchir la liste après refus
        }
        else{
            toast.error("Erreur lors du refus de la demande");
        }
    }catch(err){
        toast.error("Erreur lors du refus de la demande");
    }
  }

  /*function handleEmpty(){
    if(demandes.length==0){
      setIsEmpty(false);
    }
  }*/
  
  return (
  <>
  <Siderbar/>
  <div style={{ marginLeft: "200px" }} className="p-4">
  <div className="card shadow-sm border-0 rounded-4">
  <div className="container mt-4">
    <h2 className="mb-4">Liste des demandes</h2>

    {loading ? (
      <p>Chargement en cours...</p>
    ) : isEmpty? <div className="alert alert-warning text-center">
        Liste des demandes est vide.
    </div>
    
    :(

      <table className="table table-hover align-middle">
        <thead className="table-primary">
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Telephone</th>
            <th>Email</th>
            <th>Organisme</th>
            <th>Type Organisme</th>
            <th>Rôle</th>
            <th>Etat</th>
            <th>Date Création</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {demandes.map((demande) => (
            <tr key={demande.id}>
              <td>{demande.id}</td>
              <td>{demande.nom}</td>
              <td>{demande.prenom}</td>
              <td>{demande.telephone}</td>
              <td>{demande.email}</td>
              <td>{demande.organisme}</td>
              <td>{demande.typeOrganisme}</td>
              <td>{demande.role}</td>
              

              <td>
                <span
                  className={demande.etat === "validé"? "badge bg-success"
                      :demande.etat === "refusé"
                        ? "badge bg-danger"
                        : "badge bg-warning"
                  }
                >
                  {demande.etat}
                </span>
              </td>

              <td>
                {demande.created_at? new Date(demande.created_at).toLocaleDateString(): "-"}
              </td>

              <td>
                {demande.etat !== "validé" && (
                  <button
                    className="btn btn-success btn-sm me-2"
                    //disabled={isValidating || isRefusing} // Désactiver le bouton pendant la validation ou le refus
                    onClick={() => handleValider(demande.id)}
                  >
                    Valider
                  </button>
                )}
                {demande.etat !== "refusé" && (
                  <button
                    className="btn btn-danger btn-sm"
                    //disabled={isValidating || isRefusing} // Désactiver le bouton pendant la validation ou le refus
                    onClick={() => handleRefuser(demande.id)}
                  >
                    Refuser
                  </button>
                )}
              </td>
              

            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  </div>
  </div>
  </>
);
};

export default ListDemandes;

 