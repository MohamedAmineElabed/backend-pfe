import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import SiderbarAdmin from "../../components/siderbarAdmin";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";


const Principes = () => {
    const { backendUrl} = useContext(AppContext);
    const [principes, setPrincipes] = useState([]);
    const [pratiques, setPratiques] = useState([]);
    const [criteres, setCriteres] = useState([]);
    const [openPrincipe, setOpenPrincipe] = useState(null);
    const [showAddPrincipe, setShowAddPrincipe] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const[critereId,setCritereId]=useState(null);
    const [editingCritereData, setEditingCritereData] = useState({ nom: "", description: "" });


    const [openPratique, setOpenPratique] = useState(null);
    const [showAddCritere, setShowAddCritere] = useState(false);

    const [showAddPratique, setShowAddPratique] = useState(false);
    const [selectedPrincipeId, setSelectedPrincipeId] = useState(null);
    const [selectedPratiqueId, setSelectedPratiqueId] = useState(null);

    const [newPrincipe, setNewPrincipe] = useState({
        nom: "",
        description: "",
      });
    const [newPratique, setNewPratique] = useState({
        nom: "",
        description: "",
      });
    const [newCritere, setNewCritere] = useState({
        nom: "",
        description: "",
      });
    
    
    useEffect(() => {
        fetchPrincipes();
        fetchPratiques();
        fetchCriteres();
    }, []);

    //pour ajouter des nouveaux principes
    const handleChangeNew = (e) => {
    const { name, value } = e.target;
        setNewPrincipe(prev => ({...prev,[name]: value
        }));
    };
    //pour ajouter des nouveaux pratiques
    const handleChangeNewPratique = (e) => {
    const { name, value } = e.target;
        setNewPratique(prev => ({...prev,[name]: value
        }));
    };
    //pour ajouter des nouveaux criteres
    const handleChangeNewCritere = (e) => {
    const { name, value } = e.target;
        setNewCritere(prev => ({...prev,[name]: value
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
    const fetchPratiques = async () => {
        try {
            const res = await axios.get(`${backendUrl}/pratiques`);
            setPratiques(res.data);
            } catch (error) {
                console.error("Erreur chargement pratiques", error);
        }
    };
    const fetchCriteres = async () => {
        try {
            const res = await axios.get(`${backendUrl}/criteres`);
            setCriteres(res.data);
            } catch (error) {
                console.error("Erreur chargement criteres", error);
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
    setShowAddPrincipe(false);
    setNewPrincipe({
      nom: "",
      description: "",
    });

  } catch (error) {
    toast.error("Erreur lors de l'ajout de principe");
    console.error(error.response?.data || error);
  }
};



  const handleAddPratique = async (e) => {
        e.preventDefault();
        if (!selectedPrincipeId) return;
        /*if (pratiques.some(p => p.nom.toLowerCase() === newPratique.nom.toLowerCase())) {
            toast.error("Ce pratique existe déjà !");
            return;
  }*/
        const principe = principes.find(p => p.id === selectedPrincipeId);
        if (principe.pratiques?.some(p => p.nom.toLowerCase() === newPratique.nom.toLowerCase())) {
          toast.error("Cette pratique existe déjà !");
          return;
  }

        try {
    // Send newPrincipe to backend
    const response = await axios.post(`${backendUrl}/pratiques/create/${selectedPrincipeId}`,
         { ...newPratique, principeId: selectedPrincipeId });

    // Update local state
    setPrincipes(prev =>prev.map(p =>p.id === selectedPrincipeId
      ? { ...p, pratiques: [...(p.pratiques || []), response.data] }
      : p
  )
);

    toast.success("Pratique ajouté avec succès");

    // Close modal and reset form
    setShowAddPratique(false);
    setNewPratique({
      nom: "",
      description: "",
    });

  } catch (error) {
    toast.error("Erreur lors de l'ajout de pratique");
    console.error(error.response?.data || error);
  }
};


  const handleAddCritere = async (e) => {
        e.preventDefault();
        if (!selectedPratiqueId) return;
        /*if (pratiques.some(p => p.nom.toLowerCase() === newPratique.nom.toLowerCase())) {
            toast.error("Ce pratique existe déjà !");
            return;
  }*/
        const pratique = pratiques.find(p => p.id === selectedPratiqueId);
        if (pratiques.criteres?.some(p => p.nom.toLowerCase() === newCritere.nom.toLowerCase())) {
          toast.error("Cette Critere existe déjà !");
          return;
  }

        try {
    // Send newCritere to backend
    const response = await axios.post(`${backendUrl}/criteres/create/${selectedPratiqueId}`,
         { ...newCritere, pratiqueId: selectedPratiqueId });

    // Update local state
    setPrincipes(prev =>prev.map(principe => ({
        ...principe,
        pratiques: principe.pratiques?.map(pratique =>pratique.id === selectedPratiqueId
        ? {
            ...pratique,
            criteres: [...(pratique.criteres || []), response.data]
          }
        : pratique
    )
  }))
);


    toast.success("Critere ajouté avec succès");

    // Close modal and reset form
    setShowAddCritere(false);
    setNewCritere({
      nom: "",
      description: "",
    });

  } catch (error) {
    toast.error("Erreur lors de l'ajout de critere");
    console.error(error.response?.data || error);
  }
};

    //pour supprimer principe
  const deletePrincipe = async (id) => {
    try {
      await axios.delete(`${backendUrl}/principes/${id}`);
      setPrincipes((prev) => prev.filter((d) => d.id !== id));
      toast.success("Principe supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

  //pour supprimer pratique
  const deletePratique = async (id) => {
    try {
      await axios.delete(`${backendUrl}/pratiques/${id}`);
      //setPratiques((prev) => prev.filter((d) => d.id !== id)); 
      setPrincipes(prev =>prev.map(principe => ({      //so u don't have to refresh to see deleted pratiques
        ...principe,
        pratiques: principe.pratiques?.filter(p => p.id !== id)
      }))
    );
      toast.success("Pratique supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

  //pour supprimer critere
  const deleteCritere = async (id) => {
    try {
      await axios.delete(`${backendUrl}/criteres/${id}`);
      setPrincipes(prev =>prev.map(principe => ({
        ...principe,
        pratiques: principe.pratiques?.map(pratique => ({
        ...pratique,
          criteres: pratique.criteres?.filter(c => c.id !== id)
        }))
      }))
    );
      //setCriteres((prev) => prev.filter((d) => d.id !== id));
      toast.success("Critere supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};


  // Sauvegarder les modifications
  const handleSave = async () => {
  try {
    if (!critereId) return toast.error("Critère non sélectionné");

    await axios.put(`${backendUrl}/criteres/update/${critereId}`, {...editingCritereData,id: critereId, });
    setPrincipes((prev) =>
      prev.map((principe) => ({
        ...principe,
        pratiques: principe.pratiques?.map((pratique) => ({
          ...pratique,
          criteres: pratique.criteres?.map((critere) =>
            critere.id === critereId ? { ...critere, ...editingCritereData } : critere
          ),
        })),
      }))
    );

    setIsEditing(false);
    setCritereId(null);
    toast.success("Critère mis à jour !");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour");
    console.error(error.response?.data || error);
  }
};



  // Annuler les modifications
    const handleCancel = () => {
      setIsEditing(false);
      if (!pratiques.critere) return;

      setFormData({
        id: pratiques.critere.id || "",
        nom: pratiques.critere.nom || "",
        description: pratiques.critere.description || "",
      });
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
          <button className="btn btn-success" onClick={() => setShowAddPrincipe(true)}>
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
              <div className="card-body d-flex justify-content-between align-items-start" 
                style={{ cursor: "pointer" }}
                onClick={()=>setOpenPrincipe(openPrincipe===principe.id? null : principe.id)}>
                  <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                  <h5 className="card-title mb-0 me-3">{principe.nom}</h5>
                    <span style={{
                      background: (principe.pratiques?.length || 0) === 0 ? "#fee2e2" : "#dcfce7",
                      color: (principe.pratiques?.length || 0) === 0 ? "#dc2626" : "#0e8c52",
                      borderRadius: 20,padding: "3px 10px",fontSize: "0.68rem",fontWeight: 700
                    }}>
                    {principe.pratiques?.length} pratique{principe.pratiques?.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                 
                  <p className="card-text text-muted">{principe.description}</p>
                  </div>
                   <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={(e) => {e.stopPropagation();deletePrincipe(principe.id);}}>
                    <i className="bi bi-trash"></i>
                  </button>
              </div>

                  {/* PRATIQUES */}
<div className="mt-2">
  <button
    className="btn btn-outline-primary btn-sm mb-2 ms-2"
    onClick={() => setOpenPrincipe(openPrincipe === principe.id ? null : principe.id)}
  >
    {openPrincipe === principe.id ? "Masquer les pratiques" : "Voir les pratiques"}
    <i className={`bi ms-1 bi-chevron-${openPrincipe === principe.id ? "up" : "down"}`}></i>
  </button>

  <div
    className={`collapse ${openPrincipe === principe.id ? "show" : ""}`}
    style={{ marginTop: "5px" }}
  >
    {principe.pratiques?.length > 0 ? (
      <div style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
        
        {principe.pratiques.map((pratique) => (
          <div key={pratique.id} 
            style={{ borderBottom: "1px solid #dee2e6", paddingBottom: "15px", marginBottom: "15px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              
              <span style={{ fontWeight: "bold" }}>{pratique.nom}</span>
              {pratique.criteres && (<>
                <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                    <span style={{
                      background: (pratique.criteres?.length || 0) === 0 ? "#fee2e2" : "#dcfce7",
                      color: (pratique.criteres?.length || 0) === 0 ? "#dc2626" : "#0e8c52",
                      borderRadius: 20,padding: "3px 10px",fontSize: "0.68rem",fontWeight: 700
                    }}>
                    {pratique.criteres?.length} critere{pratique.criteres?.length > 1 ? 's' : ''}
                    </span>
                  </div>
              </>)}

            </div>
            
            
            {/* Inside your map over critere */}
{pratique.criteres.map((critere) => (
  <div
    key={critere.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      border: "1px solid #dee2e6",
      borderRadius: "6px",
      marginBottom: "6px",
      backgroundColor: "#ffffff",
    }}
  >
    {!isEditing || critereId !== critere.id ? (
      <>
        {/* LEFT : critere name */}
        <span style={{ fontSize: "0.9rem", color: "#495057" }}>{critere.nom}</span>

        {/* RIGHT : buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setCritereId(critere.id);
              setEditingCritereData({ nom: critere.nom, description: critere.description });
            }}
          >
            <i className="bi bi-pencil"></i>
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteCritere(critere.id);
            }}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </>
    ) : (
      <>
        <input
          type="text"
          value={editingCritereData.nom}
          onChange={(e) => setEditingCritereData(prev => ({ ...prev, nom: e.target.value }))}
          className="form-control form-control-sm me-2"
          style={{ maxWidth: "200px" }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
              setIsEditing(false);
            }}
          >
            enregistrer
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
              setCritereId(null);
            }}
          >
            annuler
          </button>
        </div>
      </>
    )}
  </div>
))}

            
            <button className="btn btn-link btn-sm p-0"
              style={{ color: "#28a745", textDecoration: "none",fontSize: "0.9rem",
                border: "none",background: "none",cursor: "pointer",marginTop: "4px"}}
              onClick={(e) => {
                e.stopPropagation();
                setShowAddCritere(true);
                setSelectedPratiqueId(pratique.id);
                console.log("Ajouter critère pour:", pratique.nom);
              }}
            >
              <i className="bi bi-plus"></i> Ajouter un critère
            </button>
          </div>
        ))}
        
        <button
          className="btn btn-outline-success btn-sm"
          style={{ marginTop: "10px" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAddPratique(true);
            setSelectedPrincipeId(principe.id);
          }}
        >
          <i className="bi bi-plus"></i> Ajouter une pratique
        </button>
      </div>
    ) : (
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "8px", 
        border: "1px solid #dee2e6", 
        borderRadius: "4px" 
      }}>
        <span style={{ color: "#6c757d" }}>Aucune pratique existe</span>
        <button
          className="btn btn-outline-success btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddPratique(true);
            setSelectedPrincipeId(principe.id);
          }}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>
    )}
  </div>
</div>

                </div>
            ))}
          </div>
          
        )}
        

        {showAddPrincipe && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Ajouter un principe</h5>

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

    <button type="button" className="btn btn-secondary" onClick={() => setShowAddPrincipe(false)}>
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

{showAddPratique && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Ajouter un Pratique</h5>

        <div className="row">
      
      <form onSubmit={handleAddPratique} >

  <input
    type="text"
    placeholder="Nom de pratique"
    name="nom"
    value={newPratique.nom}
    onChange={handleChangeNewPratique}
    className="form-control mb-2"
    required
  />

  <textarea
    name="description"
    placeholder="description bréve de pratique"
    value={newPratique.description}
    onChange={handleChangeNewPratique}
    className="form-control mb-2"
    //required
  />

  

  <div className="d-flex justify-content-end mt-3">
    <button type="submit" className="btn btn-primary me-2">
      Sauvegarder
    </button>

    <button type="button" className="btn btn-secondary" onClick={() => setShowAddPratique(false)}>
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



      {showAddCritere && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Ajouter un Critere</h5>

        <div className="row">
      
      <form onSubmit={handleAddCritere} >

  <input
    type="text"
    placeholder="Nom de critere"
    name="nom"
    value={newCritere.nom}
    onChange={handleChangeNewCritere}
    className="form-control mb-2"
    required
  />

  <textarea
    name="description"
    placeholder="description bréve de critere"
    value={newCritere.description}
    onChange={handleChangeNewCritere}
    className="form-control mb-2"
    //required
  />

  

  <div className="d-flex justify-content-end mt-3">
    <button type="submit" className="btn btn-primary me-2">
      Sauvegarder
    </button>

    <button type="button" className="btn btn-secondary" onClick={() => setShowAddCritere(false)}>
      Annuler
    </button>
  </div>

</form>
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

