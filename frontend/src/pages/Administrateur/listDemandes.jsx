import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";

const ListDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const[isEmpty,setIsEmpty]=useState(true);
  const { backendUrl } = React.useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // État pour indiquer si une validation est en cours 
  const[isRefusing, setIsRefusing] = useState(false); // État pour indiquer si un refus est en cours
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  // Fonction pour récupérer les demandes depuis le backend
  const fetchDemandes=async() =>{
    try{
        setLoading(true);
        const response = await axios.get(`${backendUrl}/demandes`);
        console.log("API response:", response.data);
        setDemandes(response.data);
        setIsEmpty(response.data.length === 0);

    }catch(err){
        toast.error("Erreur lors de la récupération des demandes");
    }finally{
        setLoading(false);
    }
  }
  //pour supprimer les demandes
  const deleteDemande = async (id) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${backendUrl}/demandes/${id}`);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
      toast.success("Demande supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

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
    <SiderbarAdmin />
    <div style={{ marginLeft: "200px" }} className="p-4">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <h2 className="mb-4 text-center text-primary">Liste des demandes</h2>

          {loading ? (
            <p className="text-center">Chargement en cours...</p>
          ) : isEmpty ? (
            <div className="alert alert-warning text-center">
              Liste des demandes est vide.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    {/*<th>ID</th>*/}
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Organisme</th>
                    <th>Poste</th>
                    <th>État</th>
                    <th>Date création demande</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {demandes.map((demande) => (
                    <tr key={demande.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedDemande(demande) || setShowDescription(true)}>
                      {/*<td>{demande.id}</td>*/}
                      <td>{demande.nom}</td>
                      <td>{demande.prenom}</td>
                      <td>{demande.email}</td>
                      <td>{demande.nomOrganisme}</td>
                      <td>{demande.role}</td>

                      <td>
                        <span
                          className={`badge ${
                            demande.etat === "validé"
                              ? "bg-success"
                              : demande.etat === "refusé"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {demande.etat}
                        </span>
                      </td>

                      <td>
                        {demande.created_at
                          ? new Date(demande.created_at).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                        {demande.etat !== "validé" && (
                          <button
                            className="btn btn-success btn-sm me-1"
                            onClick={(e) => { e.stopPropagation(); handleValider(demande.id); }}
                          >
                            <i className="bi bi-check-lg"></i> Valider
                          </button>
                        )}
                        {demande.etat !== "refusé" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleRefuser(demande.id); }}
                          >
                            <i className="bi bi-x-lg"></i> Refuser
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => {e.stopPropagation();deleteDemande(demande.id);}}>
                            <i className="bi bi-trash"></i>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
            </div>
          )}
          {showDescription && selectedDemande && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Description</h5>

        <div className="row">
          {/* Responsable details */}
          <div className="col-md-6">
            <h6>Responsable</h6>
            <ul className="list-unstyled">
              <li><strong>Nom :</strong> {selectedDemande.nom || "-"}</li>
              <li><strong>Prénom :</strong> {selectedDemande.prenom || "-"}</li>
              <li><strong>Email :</strong> {selectedDemande.email || "-"}</li>
              <li><strong>Poste dans organisme :</strong> {selectedDemande.role || "-"}</li>
            </ul>
          </div>

          {/* Organisme details */}
          <div className="col-md-6">
            <h6>Organisme</h6>
            <ul className="list-unstyled">
              <li><strong>Nom :</strong> {selectedDemande.nomOrganisme || "-"}</li>
              <li><strong>Adresse :</strong> {selectedDemande.adresse || "-"}</li>
              <li><strong>N°Fax :</strong> {selectedDemande.fax || "-"}</li>
              <li><strong>Téléphone :</strong> {selectedDemande.telephone || "-"}</li>
              <li><strong>Email organisme :</strong> {selectedDemande.emailOrganisme || "-"}</li>
              <li><strong>Secteur :</strong> {selectedDemande.secteur || "-"}</li>
              <li><strong>Type :</strong> {selectedDemande.typeOrganisme || "-"}</li>
            </ul>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary" onClick={() => setShowDescription(false)}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
)}
          
        </div>
      </div>
    </div>
  </>
);
};

export default ListDemandes;

 