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
      const filteredUsers = response.data.filter(user => user.role !== "ADMIN");
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
      toast.success("Utilisateur supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
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
                        <td>
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
              <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content p-4">
                    <h5 className="mb-4 text-center">Description</h5>

                    <div className="row">
                      {/* Responsable */}
                      <div className="col-md-6">
                        <h6>Responsable</h6>
                        <ul className="list-unstyled">
                          <li><strong>Nom :</strong> {selectedUser.nom || "-"}</li>
                          <li><strong>Prénom :</strong> {selectedUser.prenom || "-"}</li>
                          <li><strong>Email :</strong> {selectedUser.email || "-"}</li>
                          <li><strong>Poste :</strong> {selectedUser.role || "-"}</li>
                        </ul>
                      </div>

                      {/* Organisme */}
                      <div className="col-md-6">
                        <h6>Organisme</h6>
                        <ul className="list-unstyled">
                          <li><strong>Nom :</strong> {selectedUser.organisme?.nomOrganisme || "-"}</li>
                          <li><strong>Adresse :</strong> {selectedUser.organisme?.adresse || "-"}</li>
                          <li><strong>Fax :</strong> {selectedUser.organisme?.fax || "-"}</li>
                          <li><strong>Téléphone :</strong> {selectedUser.organisme?.telephone || "-"}</li>
                          <li><strong>Email :</strong> {selectedUser.organisme?.emailOrganisme || "-"}</li>
                          <li><strong>Secteur :</strong> {selectedUser.organisme?.secteur || "-"}</li>
                          <li><strong>Type :</strong> {selectedUser.organisme?.type || "-"}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end mt-3">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowDescription(false)}
                      >
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

export default ListUtilisateurs;