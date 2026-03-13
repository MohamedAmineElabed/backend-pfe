import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";

const ListUtilisateurs = () => {
  const [organismes, setOrganismes] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const[showModeEditing,setShowModeEditing]=useState(false);

  //pour le bouton ajouter organisme
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrganisme, setNewOrganisme] = useState({
    nomOrganisme: "",
    adresse: "",
    emailOrganisme: "",
    type: "",
    telephone: "",
    fax: "",
    dateCreation: ""
  });
  
  

  const [selectedOrganisme, setSelectedOrganisme] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const { backendUrl } = useContext(AppContext);
  //pour changer vers mode editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedOrganisme((prev) => ({
    ...prev,
    [name]: value,
  }));
};
  //pour ajouter des nouveaux organismes
  const handleChangeNew = (e) => {
  const { name, value } = e.target;
  setNewOrganisme(prev => ({
    ...prev,
    [name]: value
  }));
};

  const handleSave = async () => {
  try {
    const payload = { ...selectedOrganisme };
    delete payload.responsable;
    // Send updated organisme to backend
    await axios.put(`${backendUrl}/organismes/update/${selectedOrganisme.id}`, payload);

    // Update local state so the list reflects changes
    setOrganismes((prev) =>
      prev.map((org) =>
        org.id === selectedOrganisme.id ? selectedOrganisme : org
      )
    );

    toast.success("Organisme modifié avec succès");

    // Close modal
    setShowModeEditing(false);
  } catch (error) {
    toast.error("Erreur lors de la modification de l'organisme");
    console.error(error.response?.data || error);
  }
};


  // récupérer les utilisateurs
  const fetchOrganismes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/organismes`);
      //const filteredOrganismes = response.data.filter(org => org.responsable.role !== "ADMIN");
      //setOrganismes(filteredOrganismes);
      setOrganismes(response.data);
      setIsEmpty(response.data.length === 0);
    } catch (err) {
      toast.error("Erreur lors de la récupération des organismes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganisme = async () => {
  try {
    // Send newOrganisme to backend
    const response = await axios.post(`${backendUrl}/organismes/createOrganisme`, newOrganisme);

    // Update local state
    setOrganismes((prev) => [...prev, response.data]);

    toast.success("Organisme ajouté avec succès");

    // Close modal and reset form
    setShowAddModal(false);
    setNewOrganisme({
      nomOrganisme: "",
      adresse: "",
      emailOrganisme: "",
      type: "",
      telephone: "",
      fax: "",
      dateCreation: ""
    });

  } catch (error) {
    toast.error("Erreur lors de l'ajout de l'organisme");
    console.error(error.response?.data || error);
  }
};

  // supprimer organisme
  const deleteOrganisme = async (id) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet organisme ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${backendUrl}/organismes/${id}`);
      setOrganismes((prev) => prev.filter((u) => u.id !== id));
      toast.success("Organisme supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    if (backendUrl) {
      fetchOrganismes();
    }
  }, [backendUrl]);

  return (
    <>
      <SiderbarAdmin />

      <div style={{ marginLeft: "200px" }} className="p-4">
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <h2 className="mb-4 text-center text-primary">Liste des Organismes</h2>
            <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg"></i> Ajouter Organisme
            </button>
            </div>

            {loading ? (
      <p className="text-center">Chargement en cours...</p>
    ) : isEmpty ? (
      <div className="alert alert-warning text-center">
        Liste des organismes est vide.
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Email</th>
              <th>Secteur</th>
              <th>Type</th>
              <th>Téléphone</th>
              <th>Fax</th>
              <th>Date Création</th>
              <th>Responsable</th>
              <th>Email Responsable</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organismes.map((org) => (
              <tr key={org.id}>
                <td>{org.nomOrganisme || "-"}</td>
                <td>{org.adresse || "-"}</td>
                <td>{org.emailOrganisme || "-"}</td>
                <td>{org.secteur || "-"}</td>
                <td>{org.type || "-"}</td>
                <td>{org.telephone || "-"}</td>
                <td>{org.fax || "-"}</td>
                <td>{org.dateCreation || "-"}</td>
                <td>{org.responsable?.nom || "-"}</td>
                <td>{org.responsable?.email || "-"}</td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => {
                      setShowModeEditing(true);
                      setSelectedOrganisme(org);
                    }}
                  >
                    <i className="bi bi-pen"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => deleteOrganisme(org.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

          {showModeEditing && selectedOrganisme && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Modifier organisme</h5>

        <div className="row">
            <input
        type="text"
        name="nomOrganisme"
        value={selectedOrganisme?.nomOrganisme || ""}
        onChange={handleChange}
        className="form-control mb-2"
        />

      <input
        type="text"
        name="adresse"
        value={selectedOrganisme?.adresse || ""}
        onChange={handleChange}
        className="form-control mb-2"
      />

      <input
        type="email"
        name="emailOrganisme"
        value={selectedOrganisme?.emailOrganisme || ""}
        onChange={handleChange}
        className="form-control mb-2"
      />

      {/*<input
        type="type organisme"
        name="typeOrganisme"
        value={selectedOrganisme?.type || ""}
        onChange={handleChange}
        className="form-control mb-2"
      />*/}
      <select name="type" className="form-control mb-3" value={selectedOrganisme.type} onChange={e => {setType(e.target.value),handleChange}}>
          <option value="">Type d'organisme</option>
          <option value="publique">Publique</option>
          <option value="prive">Privé</option>
          <option value="societe civile">Société civile</option>
      </select>

      <input
        type="text"
        name="telephone"
        value={selectedOrganisme?.telephone || ""}
        onChange={handleChange}
        className="form-control mb-2"
      />

      <input
        type="text"
        name="fax"
        value={selectedOrganisme?.fax || ""}
        onChange={handleChange}
        className="form-control mb-2"
      />

      <input
        type="date"
        name="dateCreation"
        value={selectedOrganisme?.dateCreation || ""}
        onChange={handleChange}
        className="form-control mb-2"
      />
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary me-2" onClick={handleSave}>
            Sauvegarder
          </button>

          <button className="btn btn-secondary" onClick={() => setShowModeEditing(false)}>
            Annuler
          </button>
        </div>
      </div>


      

    </div>
  </div>
)}
        {/*Mode ajouter organisme*/}
        {showAddModal && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content p-4">
        <h5 className="mb-4 text-center">Ajouter un organisme</h5>

        <div className="row">
      <form onSubmit={handleAddOrganisme}>
      <input
        type="text"
        placeholder="Nom d'organisme"
        name="nomOrganisme"
        value={newOrganisme.nomOrganisme}
        onChange={handleChangeNew}
        className="form-control mb-2" required
        />

      <input
        type="text"
        name="adresse"
        placeholder="adresse de l'organisme"
        value={newOrganisme?.adresse}
        onChange={handleChangeNew}
        className="form-control mb-2" required
      />

      <input
        type="email"
        name="emailOrganisme"
        placeholder="Email de l'organisme"
        value={newOrganisme?.emailOrganisme}
        onChange={handleChangeNew}
        className="form-control mb-2" required
      />
      <select name="type" className="form-control mb-3" value={newOrganisme.type} onChange={handleChangeNew} required>
          <option value="">Choisir type d'organisme</option>
          <option value="publique">Publique</option>
          <option value="prive">Privé</option>
          <option value="societe civile">Société civile</option>
      </select>

      <input
        type="text"
        name="telephone"
        placeholder="Numéro de telephone"
        value={newOrganisme?.telephone}
        onChange={handleChangeNew}
        className="form-control mb-2" required
      />

      <input
        type="text"
        name="fax"
        placeholder="Numéro de fax"
        value={newOrganisme?.fax}
        onChange={handleChangeNew}
        className="form-control mb-2" required
      />

      <input
        type="date"
        name="dateCreation"
        placeholder="date de création d'organisme"
        value={newOrganisme?.dateCreation}
        onChange={handleChangeNew}
        className="form-control mb-2" required
      />
      </form>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary me-2" onClick={handleAddOrganisme}>
            Sauvegarder
          </button>

          <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
            Annuler
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

export default ListUtilisateurs;