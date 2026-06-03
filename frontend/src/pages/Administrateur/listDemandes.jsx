/*import React from "react";
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
      setDemandes((prev) => {
        const updated=prev.filter((d) => d.id !== id);
        setIsEmpty(updated.length === 0);
        return updated;});
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
  }

  
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
                    {/*<th>ID</th>*
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
                    <tr key={demande.id}>
                      {/*<td>{demande.id}</td>*
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
                        <button
                            className="btn btn-primary btn-sm me-1"
                            key={demande.id} style={{ cursor: "pointer" }}
                            onClick={() => setSelectedDemande(demande) || setShowDescription(true)}>
                          
                            <i className=""></i> voir details
                          </button>
                        
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
          {/* Responsable details *
          <div className="col-md-6">
            <h6>Responsable</h6>
            <ul className="list-unstyled">
              <li><strong>Nom :</strong> {selectedDemande.nom || "-"}</li>
              <li><strong>Prénom :</strong> {selectedDemande.prenom || "-"}</li>
              <li><strong>Email :</strong> {selectedDemande.email || "-"}</li>
              <li><strong>Poste dans organisme :</strong> {selectedDemande.role || "-"}</li>
            </ul>
          </div>

          {/* Organisme details *
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
          {selectedDemande.etat=="en attente"?(
          <div className="d-flex gap-2">
                        {selectedDemande?.etat !== "validé" && (
                          <button
                            className="btn btn-success btn-sm me-1"
                            onClick={(e) => { e.stopPropagation(); handleValider(selectedDemande.id);
                              setShowDescription(false)
                             }}
                          >
                            <i className="bi bi-check-lg"></i> Valider
                          </button>
                        )}
                        {selectedDemande.etat !== "refusé" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleRefuser(selectedDemande.id);
                              deleteDemande(selectedDemande.id);setShowDescription(false) }}
                          >
                            <i className="bi bi-x-lg"></i> Refuser
                          </button>
                        )}
                        {/*<button
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => {e.stopPropagation();deleteDemande(demande.id);}}>
                            <i className="bi bi-trash"></i>
                            </button>*
                          <button className="btn btn-secondary" onClick={() => setShowDescription(false)}>
                            Fermer
                          </button>
                        </div>
                        ):(
                          <button className="btn btn-secondary" onClick={() => setShowDescription(false)}>
                            Fermer
                          </button>
                        )}
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

export default ListDemandes;*/



import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────── Design tokens ─────────────────────── */
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

/* ─────────────────────── Helpers ─────────────────────── */
const Stat = ({ label, value, color }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
    padding: "16px 22px", minWidth: 130, borderTop: `3px solid ${color}`,
    boxShadow: T.shadow,
  }}>
    <div style={{ fontSize: 11, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
  </div>
);

const STATUS = {
  "validé":    { bg: T.successSoft, color: T.success, border: "#bbf7d0", dot: T.success,  label: "Validé" },
  "refusé":    { bg: T.dangerSoft,  color: T.danger,  border: "#fca5a5", dot: T.danger,   label: "Refusé" },
  "en attente":{ bg: T.warningSoft, color: T.warning, border: "#fde68a", dot: T.warning,  label: "En attente" },
};

const StateBadge = ({ etat }) => {
  const cfg = STATUS[etat] ?? { bg: T.bg, color: T.muted, border: T.border, dot: T.label, label: etat };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const Avatar = ({ nom = "", prenom = "", size = 36 }) => {
  const initials = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  const hue = ((prenom.charCodeAt(0) || 0) * 37 + (nom.charCodeAt(0) || 0) * 19) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},58%,88%)`, color: `hsl(${hue},48%,35%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
    }}>
      {initials || "?"}
    </div>
  );
};

const InfoRow = ({ icon, label, value, accent }) => (
  <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
    <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ fontSize: 13, color: accent ? T.accent : T.text, marginTop: 2 }}>{value || "—"}</div>
    </div>
  </div>
);

/* ─────────────────────── Component ─────────────────────── */
const ListDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const [selected, setSelected] = useState(null);
  const { backendUrl } = useContext(AppContext);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/demandes`);
      setDemandes(res.data);
    } catch { toast.error("Erreur lors de la récupération des demandes"); }
    finally { setLoading(false); }
  };

  const deleteDemande = async (id) => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      await axios.delete(`${backendUrl}/demandes/${id}`);
      setDemandes(p => p.filter(d => d.id !== id));
      toast.success("Demande supprimée");
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const handleValider = async (id) => {
    try {
      await axios.put(`${backendUrl}/demandes/${id}/valider`);
      toast.success("Demande validée avec succès");
      setSelected(null);
      fetchDemandes();
    } catch { toast.error("Erreur lors de la validation"); }
  };

  const handleRefuser = async (id) => {
    try {
      await axios.put(`${backendUrl}/demandes/${id}/refuser`);
      await axios.delete(`${backendUrl}/demandes/${id}`);
      toast.success("Demande refusée");
      setSelected(null);
      setDemandes(p => p.filter(d => d.id !== id));
    } catch { toast.error("Erreur lors du refus"); }
  };

  useEffect(() => { if (backendUrl) fetchDemandes(); }, [backendUrl]);

  const filtered = demandes.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = (d.nom ?? "").toLowerCase().includes(s)
      || (d.prenom ?? "").toLowerCase().includes(s)
      || (d.nomOrganisme ?? "").toLowerCase().includes(s);
    const matchEtat = filter === "tous" || d.etat?.toLowerCase() === filter;
    return matchSearch && matchEtat;
  });

  const count = (etat) => demandes.filter(d => d.etat === etat).length;
  const COLS = "1.1fr 1.1fr 1.4fr 1.3fr 1fr 110px 110px 90px";

  return (
    <>
      <SiderbarAdmin />

      <div style={{ marginLeft: 220, minHeight: "100vh", background: T.bg, padding: "32px 28px", fontFamily: T.font }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>
            Gestion des demandes
          </h1>
          <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
            Examinez, validez ou refusez les demandes d'inscription.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <Stat label="Total" value={demandes.length} color={T.accent} />
          <Stat label="En attente" value={count("en attente")} color={T.warning} />
          <Stat label="Validées" value={count("validé")} color={T.success} />
          <Stat label="Refusées" value={count("refusé")} color={T.danger} />
        </motion.div>

        {/* ── Card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
          style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Rechercher par nom, prénom ou organisme…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px 8px 34px", borderRadius: T.radiusSm,
                  border: `1px solid ${T.border}`, fontSize: 13, color: T.text,
                  background: T.bg, outline: "none", boxSizing: "border-box", fontFamily: T.font,
                }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { v: "tous", l: "Tous" },
                { v: "en attente", l: "En attente" },
                { v: "validé", l: "Validées" },
                { v: "refusé", l: "Refusées" },
              ].map(({ v, l }) => (
                <button key={v} onClick={() => setFilter(v)} style={{
                  padding: "7px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${filter === v ? T.accent : T.border}`,
                  background: filter === v ? T.accent : T.surface,
                  color: filter === v ? "#fff" : T.muted, transition: "all .18s",
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: COLS, gap: 8,
            padding: "10px 22px", background: "#f8fafd", borderBottom: `1px solid ${T.border}`,
            fontSize: 10, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {["Nom", "Prénom", "Email", "Organisme", "Rôle", "État", "Date", "Actions"].map((h, i) => (
              <span key={i}>{h}</span>
            ))}
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
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <p style={{ color: T.muted, fontSize: 14 }}>Aucune demande trouvée.</p>
            </div>
          ) : (
            filtered.map((d, idx) => (
              <motion.div key={d.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + idx * 0.035, duration: 0.28 }}
                onClick={() => setSelected(d)}
                style={{
                  display: "grid", gridTemplateColumns: COLS, gap: 8,
                  padding: "13px 22px", borderBottom: `1px solid ${T.border}`,
                  alignItems: "center", cursor: "pointer", transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafd"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Nom */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Avatar nom={d.nom} prenom={d.prenom} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{d.nom}</span>
                </div>

                <span style={{ fontSize: 13, color: T.text }}>{d.prenom}</span>
                <span style={{ fontSize: 12, color: T.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.email}</span>
                <span style={{ fontSize: 13, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.nomOrganisme || "—"}</span>
                <span style={{ fontSize: 12, color: T.muted }}>{d.jobRole || "—"}</span>
                <StateBadge etat={d.etat} />
                <span style={{ fontSize: 12, color: T.muted }}>
                  {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "—"}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelected(d)} title="Voir détails"
                    style={{ width: 28, height: 28, borderRadius: 7, cursor: "pointer", border: `1px solid #c7d2fe`, background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button onClick={() => deleteDemande(d.id)} title="Supprimer"
                    style={{ width: 28, height: 28, borderRadius: 7, cursor: "pointer", border: `1px solid #fca5a5`, background: T.dangerSoft, color: T.danger, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
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
            {filtered.length} demande{filtered.length !== 1 ? "s" : ""}
          </div>
        </motion.div>
      </div>

      {/* ─────────────── Detail Modal ─────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", 
            backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: 24 }}>

            <motion.div key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: T.surface, borderRadius: 18, width: "100%", maxWidth: 660, overflow: "hidden", boxShadow: "0 32px 80px rgba(15,23,42,0.2)", border: `1px solid ${T.border}` }}>

              {/* Modal Header */}
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar nom={selected.nom} prenom={selected.prenom} size={40} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{selected.prenom} {selected.nom}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: T.muted }}>{selected.role}</span>
                      <StateBadge etat={selected.etat} />
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  style={{ background: T.bg, border: `1px solid ${T.border}`, width: 30, height: 30, borderRadius: 8, cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

                {/* Left: responsable */}
                <div style={{ padding: "22px 24px", borderRight: `1px solid ${T.border}` }}>
                  <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Responsable
                  </p>
                  <InfoRow icon="👤" label="Nom complet" value={`${selected.prenom} ${selected.nom}`} />
                  <InfoRow icon="✉" label="Email" value={selected.email} accent />
                  <InfoRow icon="🏷" label="Poste dans l'organisme" value={selected.jobRole} />
                  <InfoRow icon="📅" label="Date de demande" value={selected.created_at ? new Date(selected.created_at).toLocaleDateString("fr-FR") : null} />
                </div>

                {/* Right: organisme */}
                <div style={{ padding: "22px 24px" }}>
                  <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Organisme
                  </p>
                  <InfoRow icon={<OrgLogo url={selected.logoUrl}/>} label="Nom" value={selected.nomOrganisme} />
                  <InfoRow icon="📍" label="Adresse" value={selected.adresse} />
                  <InfoRow icon="✉" label="Email organisme" value={selected.emailOrganisme} accent />
                  <InfoRow icon="📞" label="Téléphone" value={selected.telephone} />
                  <InfoRow icon="📠" label="Fax" value={selected.fax} />
                  <InfoRow icon="🏭" label="Secteur" value={selected.secteur} />
                  <InfoRow icon="🔖" label="Type" value={selected.typeOrganisme} />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Left: state label */}
                <div style={{ fontSize: 12, color: T.muted }}>
                  {selected.etat === "en attente"
                    ? "Cette demande est en attente de traitement."
                    : selected.etat === "validé"
                    ? "✅ Cette demande a déjà été validée."
                    : "❌ Cette demande a été refusée."}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {selected.etat === "en attente" && (
                    <>
                      <button onClick={() => handleValider(selected.id)}
                        style={{
                          padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                          border: `1px solid #6ee7b7`, background: T.successSoft, color: T.success,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Valider
                      </button>
                      <button onClick={() => handleRefuser(selected.id)}
                        style={{
                          padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                          border: `1px solid #fca5a5`, background: T.dangerSoft, color: T.danger,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        Refuser
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelected(null)}
                    style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: T.bg, color: T.muted }}>
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListDemandes;

 