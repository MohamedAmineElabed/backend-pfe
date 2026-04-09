import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";

const ListUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const { backendUrl } = useContext(AppContext);

  // récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/users`);
      const filteredUsers = response.data.filter(user => user.role !== "ADMIN" && user.role !== "EVALUATEUR");
      setUsers(filteredUsers);
      setIsEmpty(filteredUsers.length === 0);
    } catch (err) {
      toast.error("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // supprimer utilisateur
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${backendUrl}/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setIsEmpty(newUsers.length === 0);
      toast.success("Utilisateur supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  //désactiver utilisateur
  const desactiverUser = async (id) => {
    const confirmDesactiver = window.confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur ?");
    if (!confirmDesactiver) return;

    try {
      await axios.put(`${backendUrl}/users/${id}/desactiver`);
      setUsers(prev => {
      const updated = prev.map(u =>
        u.id === id ? { ...u, etat: "inactif" } : u
      );
      return updated;
    });
      toast.success("Utilisateur désactivé");
    } catch (error) {
      toast.error("Erreur lors de la désactivation");
    }
  };
  //activer utilisateur
  const activerUser = async (id) => {
    const confirmActiver = window.confirm("Êtes-vous sûr de vouloir activer cet utilisateur ?");
    if (!confirmActiver) return;

    try {
      await axios.put(`${backendUrl}/users/${id}/activer`);
      setUsers(prev => {
      const updated = prev.map(u =>
        u.id === id ? { ...u, etat: "actif" } : u
      );
      return updated;
    });
      toast.success("Utilisateur activé");
    } catch (error) {
      toast.error("Erreur lors de l'activation");
    }
  };

  useEffect(() => {
    if (backendUrl) {
      fetchUsers();
    }
  }, [backendUrl]);

  return (
    <>
      <SiderbarAdmin />

      <div style={{ marginLeft: "200px" }} className="p-4">
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <h2 className="mb-4 text-center text-primary">Liste des Utilisateurs</h2>

            {loading ? (
              <p className="text-center">Chargement en cours...</p>
            ) : isEmpty ? (
              <div className="alert alert-warning text-center">
                Liste des utilisateurs est vide.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Organisme</th>
                      <th>Poste</th>
                      <th>Etat</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDescription(true);
                        }}
                      >
                        <td>{user.nom || "-"}</td>
                        <td>{user.prenom || "-"}</td>
                        <td>{user.email || "-"}</td>
                        <td>{user.organisme?.nomOrganisme || "-"}</td>
                        <td>{user.role || "-"}</td>
                        <td>{user.etat || "-"}</td>
                        <td>
                          {user.etat ==="actif"? (
                            <button
                              className="btn btn-outline-danger btn-sm me-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                desactiverUser(user.id);
                              }}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                            
                          ) : (
                            <button
                              className="btn btn-outline-success btn-sm me-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                activerUser(user.id);
                              }}
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUser(user.id);
                            }}
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

            {/* Modal description */}
{showDescription && selectedUser && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: 24 }}>
    <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e5e5e5", width: "100%", maxWidth: 640, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "0.5px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>Fiche utilisateur</span>
        </div>
        <button onClick={() => setShowDescription(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa", lineHeight: 1 }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* Responsable */}
        <div style={{ padding: "20px 24px", borderRight: "0.5px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#185FA5" }}>
              {(selectedUser.prenom?.[0] || "") + (selectedUser.nom?.[0] || "")}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{selectedUser.prenom} {selectedUser.nom}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{selectedUser.role || "-"}</p>
            </div>
          </div>
          {[["Email", selectedUser.email], ["Poste", selectedUser.role], ["État", selectedUser.etat]].map(([label, value]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              {label === "État"
                ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} /><span style={{ fontSize: 13, color: "#0F6E56" }}>{value || "-"}</span></span>
                : <div style={{ fontSize: 13, color: label === "Email" ? "#185FA5" : "#222" }}>{value || "-"}</div>
              }
            </div>
          ))}
        </div>

        {/* Organisme */}
        <div style={{ padding: "20px 24px" }}>
          {selectedUser.organisme?.logoUrl
            ? <img src={selectedUser.organisme.logoUrl} alt="logo" style={{ width: "100%", height: 100, 
              objectFit: "contain", borderRadius: 8, border: "0.5px solid #eee", marginBottom: 16 }} />
            : <div style={{ height: 100, borderRadius: 8, background: "#f7f7f7", 
              border: "0.5px solid #eee", display: "flex", alignItems: "center", 
              justifyContent: "center", fontSize: 12, color: "#bbb", marginBottom: 16 }}>Logo</div>
          }
          {[["Nom", selectedUser.organisme?.nomOrganisme], ["Adresse", selectedUser.organisme?.adresse], ["Email", selectedUser.organisme?.emailOrganisme]].map(([label, value]) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              <div style={{ fontSize: 13, color: "#222" }}>{value || "-"}</div>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["Tél.", selectedUser.organisme?.telephone], ["Fax", selectedUser.organisme?.fax], 
            ["Secteur", selectedUser.organisme?.secteur], ["Type", selectedUser.organisme?.type]].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: 13, color: "#222" }}>{value || "-"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 24px", borderTop: "0.5px solid #eee", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowDescription(false)} 
        style={{ fontSize: 13, padding: "7px 18px", borderRadius: 8, border: "0.5px solid #ddd", 
        background: "none", cursor: "pointer", color: "#555" }}>
          Fermer
        </button>
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