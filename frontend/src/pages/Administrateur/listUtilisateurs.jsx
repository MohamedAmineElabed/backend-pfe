/*import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";
import  Input  from "../../components/ui/input.jsx";
import { motion } from "framer-motion";

const styles = {
  tableSection: { background: "#fff", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden",width: "100%"},
  tableWrap: { overflowX: "auto",width: "100%" },
  thead: { display: "grid", gridTemplateColumns: "140px 140px 180px 180px 50px 50px 100px",columnGap: "10px", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" },
  row: { display: "grid", gridTemplateColumns: "140px 140px 180px 180px 50px 50px 100px",columnGap: "10px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center", cursor: "default" },
  orgName: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
};

const stagger = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] } });

const ListUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");



  const [selectedUser, setSelectedUser] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const { backendUrl } = useContext(AppContext);

  // récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/users`,{withCredentials: true});
      const filteredUsers = response.data.filter(user => user.role !== "ADMIN" && user.role !== "EVALUATEUR");
      setUsers(filteredUsers);
      console.log("users: ",filteredUsers);
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
      await axios.delete(`${backendUrl}/users/${id}`,{withCredentials: true});
      setUsers((prev) =>prev.filter((u) => u.id !== id));
      toast.success("Utilisateur supprimé");
    } catch (error) {
      console.log("DELETE ERROR:", error.response?.status);
      console.log("DELETE ERROR DATA:", error.response?.data);
      toast.error("Erreur lors de la suppression");
    }
  };

  //désactiver utilisateur
  const desactiverUser = async (id) => {
    const confirmDesactiver = window.confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur ?");
    if (!confirmDesactiver) return;

    try {
      await axios.put(`${backendUrl}/users/${id}/desactiver`,{},{withCredentials: true});
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
      await axios.put(`${backendUrl}/users/${id}/activer`,{},{withCredentials: true});
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

  // Filtered list
  const filtered = users.filter(user => {
    const nom = user.nom ? user.nom.toLowerCase() : "";
    const prenom = user.prenom ? user.prenom.toLowerCase() : "";
    const searchValue = search ? search.toLowerCase() : "";

    const matchSearch=nom.includes(searchValue) || prenom.includes(searchValue);
    const matchEtat= filter==="tous" || user.etat?.toLowerCase()===filter.toLowerCase();
    return matchSearch && matchEtat;
  });

  const filters = [
  { value: "tous", label: "Tous" },
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Non actif" },
];


  return (
    <>
      <SiderbarAdmin />

      <div style={{ marginLeft: "200px" }} className="p-4">
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body" style={{width: "80%"}}>
            <h2 className="mb-4 text-center text-primary">Liste des Utilisateurs</h2>

            {loading ? (
              <p className="text-center">Chargement en cours...</p>
            ) : isEmpty ? (
              <div className="alert alert-warning text-center">
                Liste des utilisateurs est vide.
              </div>
            ) : (
              <>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
                {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{ padding: "6px 12px", borderRadius: 6, border: filter === f.value ? "1px solid #6366f1" : "1px solid #e5e7eb", background: filter === f.value ? "#6366f1" : "#f8fafc", color: filter === f.value ? "#fff" : "#475569", cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
              </div>
              <div style={styles.tableSection}>

                  {/* Table 
        <motion.section {...stagger(3)} style={styles.tableSection}>
          <div style={styles.tableWrap}>
            <div style={styles.thead}>
              {["Nom", "Prenom", "Organisme", "Role", "Etat", "Action"].map((col, i) => <span key={i}>{col}</span>)}
            </div>

            {filtered.map((user, idx) => {
              //const cfg = STATUS[ev.statut] || { label: "Inconnu", dot: "#cbd5e1", text: "#475569", bg: "rgba(203,213,225,0.12)", border: "rgba(203,213,225,0.3)" };
              //const color = progressColor(ev.progression || 0);
              return (
                <motion.div key={user.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + idx * 0.05 }} style={{ ...styles.row, cursor: "pointer" }}
                  onClick={() => {setSelectedUser(user);setShowDescription(true);}}>
                  <span style={styles.orgName}>{user.nom}</span>
                  {/*<span style={styles.dateCell}>{new Date(ev.dateSoumission).toLocaleDateString("fr-FR")}</span>
                  <span style={styles.orgName}>{user.prenom}</span>
                  <span style={styles.orgName}>{user?.organisme?.nomOrganisme}</span>
                  <span style={styles.orgName}>{user.role}</span>
                  <span style={styles.orgName}>{user.etat}</span>
                  <span style={styles.orgName}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                          </div></span>
                  
                </motion.div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center" }}>Aucun utilisateur trouvé.</div>}
          </div>
        </motion.section>

                  {/*<tbody>
                    {filtered.map((user) => (
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
              </div>
              </>
            )}

            {/* Modal description 
{showDescription && selectedUser && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: 24 }}>
    <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e5e5e5", width: "100%", maxWidth: 640, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

      {/* Header 
      <div style={{ padding: "16px 24px", borderBottom: "0.5px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>Fiche utilisateur</span>
        </div>
        <button onClick={() => setShowDescription(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa", lineHeight: 1 }}>✕</button>
      </div>

      {/* Body 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* Responsable 
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

        {/* Organisme 
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

      {/* Footer 
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

export default ListUtilisateurs;*/



import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────── Design tokens ─────────────────────────── */
const T = {
  bg: "#f4f6fb",
  surface: "#ffffff",
  border: "#e8ecf4",
  accent: "#4f6ef7",
  accentSoft: "#eef0fe",
  danger: "#ef4444",
  dangerSoft: "#fff1f1",
  success: "#10b981",
  successSoft: "#ecfdf5",
  text: "#0f172a",
  muted: "#64748b",
  label: "#94a3b8",
  shadow: "0 2px 16px rgba(79,110,247,0.08)",
  radius: "14px",
  radiusSm: "8px",
};

/* ─────────────────────────── Helpers ─────────────────────────── */
const Avatar = ({ prenom = "", nom = "", size = 38 }) => {
  const initials = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  const hue = ((prenom.charCodeAt(0) || 0) * 37 + (nom.charCodeAt(0) || 0) * 19) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},60%,88%)`, color: `hsl(${hue},50%,35%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, fontFamily: "inherit",
    }}>
      {initials || "?"}
    </div>
  );
};

const Badge = ({ active }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
    borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
    background: active ? T.successSoft : "#f1f5f9",
    color: active ? T.success : T.muted,
    border: `1px solid ${active ? "#bbf7d0" : "#e2e8f0"}`,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? T.success : "#94a3b8" }} />
    {active ? "Actif" : "Inactif"}
  </span>
);

const RolePill = ({ role }) => (
  <span style={{
    padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: T.accentSoft, color: T.accent, border: `1px solid #c7d2fe`,
  }}>
    {role}
  </span>
);

const Stat = ({ label, value, color }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
    padding: "16px 22px", minWidth: 120,
    borderTop: `3px solid ${color}`,
    boxShadow: T.shadow,
  }}>
    <div style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{label}</div>
  </div>
);

/* ─────────────────────────── Component ─────────────────────────── */
const ListUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const [selectedUser, setSelectedUser] = useState(null);
  const { backendUrl } = useContext(AppContext);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/users`, { withCredentials: true });
      const data = res.data.filter(u => u.role !== "ADMIN" && u.role !== "EVALUATEUR");
      setUsers(data);
    } catch { toast.error("Erreur lors de la récupération des utilisateurs"); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`${backendUrl}/users/${id}`, { withCredentials: true });
      setUsers(p => p.filter(u => u.id !== id));
      toast.success("Utilisateur supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const toggleUser = async (user) => {
    const isActive = user.etat === "actif";
    if (!window.confirm(`${isActive ? "Désactiver" : "Activer"} cet utilisateur ?`)) return;
    const endpoint = isActive ? "desactiver" : "activer";
    try {
      await axios.put(`${backendUrl}/users/${user.id}/${endpoint}`, {}, { withCredentials: true });
      setUsers(p => p.map(u => u.id === user.id ? { ...u, etat: isActive ? "inactif" : "actif" } : u));
      toast.success(`Utilisateur ${isActive ? "désactivé" : "activé"}`);
    } catch { toast.error("Erreur"); }
  };

  useEffect(() => { if (backendUrl) fetchUsers(); }, [backendUrl]);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const match = (u.nom ?? "").toLowerCase().includes(s) || (u.prenom ?? "").toLowerCase().includes(s);
    const etat = filter === "tous" || u.etat?.toLowerCase() === filter;
    return match && etat;
  });

  const actifs = users.filter(u => u.etat === "actif").length;
  const inactifs = users.filter(u => u.etat === "inactif").length;

  const COLS = "1fr 1fr 1.4fr 1fr 100px 110px";

  return (
    <>
      <SiderbarAdmin />

      <div style={{ marginLeft: 220, minHeight: "100vh", background: T.bg, padding: "32px 28px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>
            Gestion des utilisateurs
          </h1>
          <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
            Consultez, activez ou supprimez les comptes utilisateurs.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <Stat label="Total utilisateurs" value={users.length} color={T.accent} />
          <Stat label="Actifs" value={actifs} color={T.success} />
          <Stat label="Inactifs" value={inactifs} color="#f59e0b" />
        </motion.div>

        {/* ── Card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
          style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Rechercher par nom ou prénom…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px 8px 34px", borderRadius: T.radiusSm,
                  border: `1px solid ${T.border}`, fontSize: 13, color: T.text,
                  background: T.bg, outline: "none", boxSizing: "border-box",
                  transition: "border-color .2s",
                }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6 }}>
              {[{ v: "tous", l: "Tous" }, { v: "actif", l: "Actifs" }, { v: "inactif", l: "Inactifs" }].map(({ v, l }) => (
                <button key={v} onClick={() => setFilter(v)} style={{
                  padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${filter === v ? T.accent : T.border}`,
                  background: filter === v ? T.accent : T.surface,
                  color: filter === v ? "#fff" : T.muted,
                  transition: "all .18s",
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div style={{
            display: "grid", gridTemplateColumns: COLS, gap: 8,
            padding: "10px 22px", background: "#f8fafd",
            borderBottom: `1px solid ${T.border}`,
            fontSize: 10, fontWeight: 700, color: T.label,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {["Nom", "Prénom", "Organisme", "Rôle", "État", "Actions"].map(h => <span key={h}>{h}</span>)}
          </div>

          {/* Table Body */}
          {loading ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ display: "inline-block", width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ marginTop: 12, color: T.muted, fontSize: 13 }}>Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: T.muted, fontSize: 14 }}>
              Aucun utilisateur trouvé.
            </div>
          ) : (
            filtered.map((user, idx) => (
              <motion.div key={user.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + idx * 0.04, duration: 0.3 }}
                onClick={() => setSelectedUser(user)}
                style={{
                  display: "grid", gridTemplateColumns: COLS, gap: 8,
                  padding: "13px 22px", borderBottom: `1px solid ${T.border}`,
                  alignItems: "center", cursor: "pointer",
                  transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafd"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Nom */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar prenom={user.prenom} nom={user.nom} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{user.nom}</span>
                </div>

                <span style={{ fontSize: 13, color: T.text }}>{user.prenom}</span>
                <span style={{ fontSize: 13, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.organisme?.nomOrganisme ?? "—"}
                </span>
                <RolePill role={user.jobRole} />
                <Badge active={user.etat === "actif"} />

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  {/* Toggle active/inactive */}
                  <button onClick={() => toggleUser(user)} title={user.etat === "actif" ? "Désactiver" : "Activer"}
                    style={{
                      width: 30, height: 30, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${user.etat === "actif" ? "#fca5a5" : "#6ee7b7"}`,
                      background: user.etat === "actif" ? T.dangerSoft : T.successSoft,
                      color: user.etat === "actif" ? T.danger : T.success,
                      transition: "all .15s",
                    }}>
                    {user.etat === "actif"
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    }
                  </button>

                  {/* Delete */}
                  <button onClick={() => deleteUser(user.id)} title="Supprimer"
                    style={{
                      width: 30, height: 30, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid #fca5a5`, background: T.dangerSoft, color: T.danger,
                      transition: "all .15s",
                    }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))
          )}

          {/* Footer */}
          <div style={{ padding: "10px 22px", fontSize: 12, color: T.label, borderTop: `1px solid ${T.border}` }}>
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </div>
        </motion.div>
      </div>

      {/* ─────────────── Modal ─────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: 24 }}>

            <motion.div key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: T.surface, borderRadius: 18, width: "100%", maxWidth: 620, overflow: "hidden", boxShadow: "0 32px 80px rgba(15,23,42,0.2)", border: `1px solid ${T.border}` }}>

              {/* Modal Header */}
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar prenom={selectedUser.prenom} nom={selectedUser.nom} size={36} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{selectedUser.prenom} {selectedUser.nom}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{selectedUser.role}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)}
                  style={{ background: T.bg, border: `1px solid ${T.border}`, width: 30, height: 30, borderRadius: 8, cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

                {/* Left: user info */}
                <div style={{ padding: "22px 24px", borderRight: `1px solid ${T.border}` }}>
                  <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Informations
                  </p>
                  {[
                    { label: "Email", value: selectedUser.email, icon: "✉" },
                    { label: "Rôle", value: selectedUser.jobRole, icon: "🏷" },
                    { label: "État", value: selectedUser.etat, icon: "●" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, marginTop: 1 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
                        {label === "État"
                          ? <Badge active={value === "actif"} />
                          : <div style={{ fontSize: 13, color: label === "Email" ? T.accent : T.text, marginTop: 2 }}>{value || "—"}</div>
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: organisme */}
                <div style={{ padding: "22px 24px" }}>
                  <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Organisme
                  </p>
                  {selectedUser.organisme?.logoUrl
                    ? <img src={selectedUser.organisme.logoUrl} alt="logo"
                        style={{ width: "100%", height: 80, objectFit: "contain", borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 14 }} />
                    : <div style={{ height: 80, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.label, marginBottom: 14 }}>
                        Aucun logo
                      </div>
                  }

                  {[
                    ["Nom", selectedUser.organisme?.nomOrganisme],
                    ["Adresse", selectedUser.organisme?.adresse],
                    ["Email", selectedUser.organisme?.emailOrganisme],
                  ].map(([l, v]) => (
                    <div key={l} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                      <div style={{ fontSize: 13, color: T.text }}>{v || "—"}</div>
                    </div>
                  ))}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                    {[["Tél.", selectedUser.organisme?.telephone], ["Fax", selectedUser.organisme?.fax],
                      ["Secteur", selectedUser.organisme?.secteur], ["Type", selectedUser.organisme?.type]].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                        <div style={{ fontSize: 13, color: T.text }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => toggleUser(selectedUser)}
                  style={{
                    padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${selectedUser.etat === "actif" ? "#fca5a5" : "#6ee7b7"}`,
                    background: selectedUser.etat === "actif" ? T.dangerSoft : T.successSoft,
                    color: selectedUser.etat === "actif" ? T.danger : T.success,
                  }}>
                  {selectedUser.etat === "actif" ? "Désactiver" : "Activer"}
                </button>
                <button onClick={() => setSelectedUser(null)}
                  style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: T.bg, color: T.muted }}>
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListUtilisateurs;