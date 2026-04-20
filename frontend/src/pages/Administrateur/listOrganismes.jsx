/*import React, { useState, useEffect, useContext } from "react";
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
    toast.error("Organisme existe déja");
    console.error(error.response?.data || error);
  }
};


  // récupérer les utilisateurs
  const fetchOrganismes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/organismes`,{withCredentials: true});
      const filteredOrganismes = response.data.filter(org => org.responsable?.role !== "ADMIN" && org.responsable?.role !== "EVALUATEUR");    //org.responsable?.role iptional chaing pour verifier si le responsable existe ou non
      setOrganismes(filteredOrganismes);
      //setOrganismes(response.data);
      setIsEmpty(filteredOrganismes.length === 0);
    } catch (err) {
      toast.error("Erreur lors de la récupération des organismes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganisme = async (e) => {
  e.preventDefault();
  try {
    // Send newOrganisme to backend
    const response = await axios.post(`${backendUrl}/organismes/createOrganisme`, newOrganisme,{withCredentials: true});

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
      await axios.delete(`${backendUrl}/organismes/${id}`,{withCredentials: true});
      setOrganismes((prev) => {
        const newList = prev.filter((u) => u.id !== id);
        setIsEmpty(newList.length === 0);
        return newList;
      });
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
              <th>Logo</th>
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
                <td><img 
                      src={org.logoUrl}
                      alt="logo"
                      style={{width: "100%", height: "100%", objectFit: "cover"}}
                /></td>
                <td>{org.nomOrganisme || "-"}</td>
                <td>{org.adresse || "-"}</td>
                <td>{org.emailOrganisme || "-"}</td>
                <td>{org.secteur || "-"}</td>
                <td>{org.type || "-"}</td>
                <td>{org.telephone || "-"}</td>
                <td>{org.fax || "-"}</td>
                <td>{org.dateCreation || "-"}</td>
                <td>{org.responsable ? `${org.responsable.nom} ${org.responsable.prenom}` : "-"}</td>
                <td>{org.responsable?.email || "-"}</td>
                <td className="text-end">
                  {/*<button
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

       {/*   {showModeEditing && selectedOrganisme && (
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
      />
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

          <button className="btn btn-secondary" {/*onClick={() => setShowModeEditing(false)}>
            Annuler
          </button>
        </div>
      </div>


      

    </div>
  </div>
)}*
        {/*Mode ajouter organisme*
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
    className="form-control mb-2"
    required
  />

  <input
    type="text"
    name="adresse"
    placeholder="adresse de l'organisme"
    value={newOrganisme.adresse}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  <input
    type="email"
    name="emailOrganisme"
    placeholder="Email de l'organisme"
    value={newOrganisme.emailOrganisme}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  <select
    name="type"
    className="form-control mb-3"
    value={newOrganisme.type}
    onChange={handleChangeNew}
    required
  >
    <option value="">Choisir type d'organisme</option>
    <option value="publique">Publique</option>
    <option value="prive">Privé</option>
    <option value="societe civile">Société civile</option>
  </select>

  <input
    type="text"
    name="telephone"
    placeholder="Numéro de telephone"
    value={newOrganisme.telephone}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  <input
    type="text"
    name="fax"
    placeholder="Numéro de fax"
    value={newOrganisme.fax}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  <input
    type="date"
    name="dateCreation"
    value={newOrganisme.dateCreation}
    onChange={handleChangeNew}
    className="form-control mb-2"
    required
  />

  <div className="d-flex justify-content-end mt-3">
    <button type="submit" className="btn btn-primary me-2">
      Sauvegarder
    </button>

    <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
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
        </div>*
      
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

export default ListUtilisateurs;*/



import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────── Design tokens (same system) ─────────────────────── */
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
  warning: "#f59e0b",
  warningSoft: "#fffbeb",
  text: "#0f172a",
  muted: "#64748b",
  label: "#94a3b8",
  shadow: "0 2px 16px rgba(79,110,247,0.08)",
  radius: "14px",
  radiusSm: "8px",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

/* ─────────────────────── Helpers ─────────────────────── */
const Stat = ({ label, value, color, icon }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
    padding: "16px 22px", minWidth: 130, borderTop: `3px solid ${color}`,
    boxShadow: T.shadow, display: "flex", flexDirection: "column", gap: 4,
  }}>
    <div style={{ fontSize: 11, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>{value}</div>
  </div>
);

const TypeBadge = ({ type }) => {
  const map = {
    publique: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "Publique" },
    prive:    { bg: "#faf5ff", color: "#7c3aed", border: "#ddd6fe", label: "Privé" },
    "societe civile": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Société civile" },
  };
  const cfg = map[type?.toLowerCase()] ?? { bg: T.bg, color: T.muted, border: T.border, label: type || "—" };
  return (
    <span style={{ padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
};

const OrgLogo = ({ url, nom, size = 34 }) => {
  const initial = (nom ?? "?")[0].toUpperCase();
  const hue = (nom?.charCodeAt(0) ?? 0) * 47 % 360;
  if (url) return <img src={url} alt="logo" style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, border: `1px solid ${T.border}` }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: `hsl(${hue},55%,90%)`, color: `hsl(${hue},50%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 800, flexShrink: 0 }}>
      {initial}
    </div>
  );
};

/* ─────────────── Field component for the form ─────────────── */
const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  padding: "9px 12px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
  fontSize: 13, color: T.text, background: T.bg, outline: "none",
  fontFamily: T.font, width: "100%", boxSizing: "border-box", transition: "border-color .2s",
};

/* ─────────────────────── Main Component ─────────────────────── */
const ListOrganismes = () => {
  const [organismes, setOrganismes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("tous");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);  // detail modal

  const [newOrganisme, setNewOrganisme] = useState({
    nomOrganisme: "", adresse: "", emailOrganisme: "",
    type: "", telephone: "", fax: "", dateCreation: "",
  });

  const { backendUrl } = useContext(AppContext);

  const fetchOrganismes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/organismes`, { withCredentials: true });
      const data = res.data.filter(o => o.responsable?.role !== "ADMIN" && o.responsable?.role !== "EVALUATEUR");
      setOrganismes(data);
    } catch { toast.error("Erreur lors de la récupération des organismes"); }
    finally { setLoading(false); }
  };

  const deleteOrganisme = async (id) => {
    if (!window.confirm("Supprimer cet organisme ?")) return;
    try {
      await axios.delete(`${backendUrl}/organismes/${id}`, { withCredentials: true });
      setOrganismes(p => p.filter(o => o.id !== id));
      toast.success("Organisme supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/organismes/createOrganisme`, newOrganisme, { withCredentials: true });
      setOrganismes(p => [...p, res.data]);
      toast.success("Organisme ajouté avec succès");
      setShowAddModal(false);
      setNewOrganisme({ nomOrganisme: "", adresse: "", emailOrganisme: "", type: "", telephone: "", fax: "", dateCreation: "" });
    } catch { toast.error("Erreur lors de l'ajout de l'organisme"); }
  };

  useEffect(() => { if (backendUrl) fetchOrganismes(); }, [backendUrl]);

  const filtered = organismes.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = (o.nomOrganisme ?? "").toLowerCase().includes(s) || (o.adresse ?? "").toLowerCase().includes(s);
    const matchType = filterType === "tous" || o.type?.toLowerCase() === filterType;
    return matchSearch && matchType;
  });

  const COLS = "44px 1fr 1fr 1fr 75px 70px 100px 100px";

  return (
    <>
      <SiderbarAdmin />

      <div style={{ marginLeft: 220, minHeight: "100vh", background: T.bg, padding: "32px 28px", fontFamily: T.font }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>
              Gestion des organismes
            </h1>
            <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
              Consultez et gérez tous les organismes enregistrés.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: T.accent, color: "#fff", border: "none", cursor: "pointer",
            boxShadow: "0 2px 12px rgba(79,110,247,0.3)", transition: "opacity .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Ajouter un organisme
          </button>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <Stat label="Total" value={organismes.length} color={T.accent} />
          <Stat label="Publiques" value={organismes.filter(o => o.type?.toLowerCase() === "publique").length} color="#2563eb" />
          <Stat label="Privés" value={organismes.filter(o => o.type?.toLowerCase() === "prive").length} color="#7c3aed" />
          <Stat label="Société civile" value={organismes.filter(o => o.type?.toLowerCase() === "societe civile").length} color={T.success} />
        </motion.div>

        {/* ── Main card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
          style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input placeholder="Rechercher par nom ou adresse…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 34 }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ v: "tous", l: "Tous" }, { v: "publique", l: "Publique" }, { v: "prive", l: "Privé" }, { v: "societe civile", l: "Société civile" }].map(({ v, l }) => (
                <button key={v} onClick={() => setFilterType(v)} style={{
                  padding: "7px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${filterType === v ? T.accent : T.border}`,
                  background: filterType === v ? T.accent : T.surface,
                  color: filterType === v ? "#fff" : T.muted, transition: "all .18s",
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: COLS, gap: 8, padding: "10px 22px",
            background: "#f8fafd", borderBottom: `1px solid ${T.border}`,
            fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {["", "Nom", "Adresse", "Email", "Type", "Téléphone", "Fax", "Responsable"].map((h, i) => <span key={i}>{h}</span>)}
          </div>

          {/* Table body */}
          {loading ? (
            <div style={{ padding: 56, textAlign: "center" }}>
              <div style={{ display: "inline-block", width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ marginTop: 12, color: T.muted, fontSize: 13 }}>Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 56, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏢</div>
              <p style={{ color: T.muted, fontSize: 14 }}>Aucun organisme trouvé.</p>
            </div>
          ) : (
            filtered.map((org, idx) => (
              <motion.div key={org.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + idx * 0.035, duration: 0.28 }}
                onClick={() => setSelectedOrg(org)}
                style={{ display: "grid", gridTemplateColumns: COLS, gap: 8, padding: "13px 22px", borderBottom: `1px solid ${T.border}`, alignItems: "center", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafd"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <OrgLogo url={org.logoUrl} nom={org.nomOrganisme} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{org.nomOrganisme || "—"}</div>
                  {org.secteur && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{org.secteur}</div>}
                </div>
                <span style={{ fontSize: 13, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.adresse || "—"}</span>
                <span style={{ fontSize: 13, color: T.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.emailOrganisme || "—"}</span>
                <TypeBadge type={org.type} />
                <span style={{ fontSize: 13, color: T.text }}>{org.telephone || "—"}</span>
                <span style={{ fontSize: 13, color: T.muted }}>{org.fax || "—"}</span>

                {/* Responsable + action */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {org.responsable ? `${org.responsable.nom} ${org.responsable.prenom}` : "—"}
                  </span>
                  <button onClick={e => { e.stopPropagation(); deleteOrganisme(org.id); }} title="Supprimer"
                    style={{ width: 28, height: 28, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid #fca5a5`, background: T.dangerSoft, color: T.danger, transition: "all .15s", flexShrink: 0, marginLeft: 6 }}>
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
            {filtered.length} organisme{filtered.length !== 1 ? "s" : ""}
          </div>
        </motion.div>
      </div>

      {/* ─────────────── Detail Modal ─────────────── */}
      <AnimatePresence>
        {selectedOrg && (
          <motion.div key="detail-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedOrg(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: 24 }}>
            <motion.div key="detail-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: T.surface, borderRadius: 18, width: "100%", maxWidth: 640, overflow: "hidden", boxShadow: "0 32px 80px rgba(15,23,42,0.2)", border: `1px solid ${T.border}` }}>

              {/* Header */}
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <OrgLogo url={selectedOrg.logoUrl} nom={selectedOrg.nomOrganisme} size={42} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{selectedOrg.nomOrganisme}</div>
                    <TypeBadge type={selectedOrg.type} />
                  </div>
                </div>
                <button onClick={() => setSelectedOrg(null)}
                  style={{ background: T.bg, border: `1px solid ${T.border}`, width: 30, height: 30, borderRadius: 8, cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              {/* Body */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {/* Left */}
                <div style={{ padding: "22px 24px", borderRight: `1px solid ${T.border}` }}>
                  <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>Coordonnées</p>
                  {[
                    ["Adresse", selectedOrg.adresse, "📍"],
                    ["Email", selectedOrg.emailOrganisme, "✉"],
                    ["Téléphone", selectedOrg.telephone, "📞"],
                    ["Fax", selectedOrg.fax, "📠"],
                    ["Date création", selectedOrg.dateCreation, "📅"],
                  ].map(([l, v, icon]) => (
                    <div key={l} style={{ marginBottom: 12, display: "flex", gap: 9 }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                        <div style={{ fontSize: 13, color: l === "Email" ? T.accent : T.text, marginTop: 1 }}>{v || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Right */}
                <div style={{ padding: "22px 24px" }}>
                  <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>Responsable</p>
                  {selectedOrg.responsable ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                          {(selectedOrg.responsable.prenom?.[0] ?? "") + (selectedOrg.responsable.nom?.[0] ?? "")}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{selectedOrg.responsable.prenom} {selectedOrg.responsable.nom}</div>
                          <div style={{ fontSize: 12, color: T.muted }}>{selectedOrg.responsable.jobRole}</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>Email</div>
                        <div style={{ fontSize: 13, color: T.accent }}>{selectedOrg.responsable.email || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: T.muted, padding: "16px 0" }}>Aucun responsable assigné.</div>
                  )}

                  <div style={{ marginTop: 22 }}>
                    <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>Détails</p>
                    {[["Secteur", selectedOrg.secteur], ["Type", selectedOrg.type]].map(([l, v]) => (
                      <div key={l} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                        <div style={{ fontSize: 13, color: T.text }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "13px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => { deleteOrganisme(selectedOrg.id); setSelectedOrg(null); }}
                  style={{ padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid #fca5a5`, background: T.dangerSoft, color: T.danger }}>
                  Supprimer
                </button>
                <button onClick={() => setSelectedOrg(null)}
                  style={{ padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: T.bg, color: T.muted }}>
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────── Add Modal ─────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div key="add-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: 24 }}>
            <motion.div key="add-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: T.surface, borderRadius: 18, width: "100%", maxWidth: 560, overflow: "hidden", boxShadow: "0 32px 80px rgba(15,23,42,0.2)", border: `1px solid ${T.border}` }}>

              {/* Header */}
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Ajouter un organisme</span>
                </div>
                <button onClick={() => setShowAddModal(false)}
                  style={{ background: T.bg, border: `1px solid ${T.border}`, width: 30, height: 30, borderRadius: 8, cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              {/* Form */}
              <form onSubmit={handleAdd}>
                <div style={{ padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field label="Nom de l'organisme *">
                      <input type="text" name="nomOrganisme" placeholder="Ex: Ministère de l'Éducation" value={newOrganisme.nomOrganisme}
                        onChange={e => setNewOrganisme(p => ({ ...p, [e.target.name]: e.target.value }))}
                        required style={inputStyle}
                        onFocus={e => e.target.style.borderColor = T.accent}
                        onBlur={e => e.target.style.borderColor = T.border} />
                    </Field>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field label="Adresse *">
                      <input type="text" name="adresse" placeholder="Ex: 12 Rue de la République, Tunis" value={newOrganisme.adresse}
                        onChange={e => setNewOrganisme(p => ({ ...p, [e.target.name]: e.target.value }))}
                        required style={inputStyle}
                        onFocus={e => e.target.style.borderColor = T.accent}
                        onBlur={e => e.target.style.borderColor = T.border} />
                    </Field>
                  </div>
                  <Field label="Email *">
                    <input type="email" name="emailOrganisme" placeholder="contact@organisme.tn" value={newOrganisme.emailOrganisme}
                      onChange={e => setNewOrganisme(p => ({ ...p, [e.target.name]: e.target.value }))}
                      required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border} />
                  </Field>
                  <Field label="Type *">
                    <select name="type" value={newOrganisme.type}
                      onChange={e => setNewOrganisme(p => ({ ...p, type: e.target.value }))}
                      required style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border}>
                      <option value="">Choisir…</option>
                      <option value="publique">Publique</option>
                      <option value="prive">Privé</option>
                      <option value="societe civile">Société civile</option>
                    </select>
                  </Field>
                  <Field label="Téléphone *">
                    <input type="text" name="telephone" placeholder="+216 XX XXX XXX" value={newOrganisme.telephone}
                      onChange={e => setNewOrganisme(p => ({ ...p, [e.target.name]: e.target.value }))}
                      required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border} />
                  </Field>
                  <Field label="Fax">
                    <input type="text" name="fax" placeholder="+216 XX XXX XXX" value={newOrganisme.fax}
                      onChange={e => setNewOrganisme(p => ({ ...p, [e.target.name]: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border} />
                  </Field>
                  <Field label="Date de création *">
                    <input type="date" name="dateCreation" value={newOrganisme.dateCreation}
                      onChange={e => setNewOrganisme(p => ({ ...p, [e.target.name]: e.target.value }))}
                      required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border} />
                  </Field>
                </div>

                {/* Footer */}
                <div style={{ padding: "13px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: T.bg, color: T.muted }}>
                    Annuler
                  </button>
                  <button type="submit"
                    style={{ padding: "8px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: T.accent, color: "#fff", boxShadow: "0 2px 10px rgba(79,110,247,0.3)" }}>
                    Sauvegarder
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListOrganismes;