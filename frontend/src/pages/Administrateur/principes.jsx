import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import SiderbarAdmin from "../../components/siderbarAdmin";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";


const Principes = () => {
    const { backendUrl} = useContext(AppContext);
    const [principes, setPrincipes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPrincipe, setNewPrincipe] = useState({
        nom: "",
        description: "",
      });
    
    
    useEffect(() => {
        fetchPrincipes();
    }, []);

    //pour ajouter des nouveaux organismes
    const handleChangeNew = (e) => {
    const { name, value } = e.target;
        setNewPrincipe(prev => ({...prev,[name]: value
        }));
    };

    const fetchPrincipes = async () => {
        try {
            const res = await axios.get(`${backendUrl}/principes`);
            setPrincipes(res.data);
            } catch (error) {
                console.error("Erreur chargement principes", error);
        }
    };

    const handleAddPrincipe = async (e) => {
        e.preventDefault();
        if (principes.some(p => p.nom.toLowerCase() === newPrincipe.nom.toLowerCase())) {
            toast.error("Ce principe existe déjà !");
            return;
  }
        try {
    // Send newPrincipe to backend
    const response = await axios.post(`${backendUrl}/principes/create`, newPrincipe);

    // Update local state
    setPrincipes((prev) => [...prev, response.data]);

    toast.success("Principe ajouté avec succès");

    // Close modal and reset form
    setShowAddModal(false);
    setNewPrincipe({
      nom: "",
      description: "",
    });

  } catch (error) {
    toast.error("Erreur lors de l'ajout de principe");
    console.error(error.response?.data || error);
  }
};

    //pour supprimer principe
  const deletePrincipe = async (id) => {
    try {
      await axios.delete(`${backendUrl}/principes/${id}`);
      setPrincipes((prev) => prev.filter((d) => d.id !== id));
      toast.success("Demande supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", minHeight: "100vh" }}>
        <SiderbarAdmin />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: "#f8f9fa", padding: "20px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary">Liste des Principes</h2>
          <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg"></i> Ajouter Principe
          </button>
        </div>
        {principes.length === 0 ? (
          <div className="container mt-4">
            <div className="alert alert-info text-center">Aucun principe disponible.</div>
          </div>
        ) : (
            
          <div className="container mt-4">
            {principes.map((principe) => (
              <div className="card shadow mb-3" key={principe.id} style={{ width: "700px" }}>
                <div className="card-body d-flex justify-content-between align-items-start">
                  <h5 className="card-title mb-0 me-3">
                    {principe.nom}
                  </h5>
                  <p className="card-text text-muted">{principe.description}</p>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={(e) => {e.stopPropagation();deletePrincipe(principe.id);}}>
                    <i className="bi bi-trash"></i>
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Ajouter un organisme</h5>

        <div className="row">
      
      <form onSubmit={handleAddPrincipe} >

  <input
    type="text"
    placeholder="Nom de principe"
    name="nom"
    value={newPrincipe.nom}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  <textarea
    name="description"
    placeholder="description bréve de principe"
    value={newPrincipe.description}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  

  <div className="d-flex justify-content-end mt-3">
    <button type="submit" className="btn btn-primary me-2">
      Sauvegarder
    </button>

    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
      Annuler
    </button>
  </div>

</form>


     {/* <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary me-2" onClick={handleAddOrganisme}>
            Sauvegarder
          </button>

          <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
            Annuler
          </button>
        </div>*/}
      
        </div>

      </div>


      

    </div>
  </div>
)}
      </div>
    </div>

    
);
};

export default Principes;

