import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import SiderbarAdmin from "../../components/siderbarAdmin";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";

/* ── Design tokens (identiques au Login) ─────────────────────── */
const BLUE_DARK  = "linear-gradient(135deg,#1e3a5f,#2d5282)";
const BLUE_1     = "#1e3a5f";
const BLUE_2     = "#2d5282";

const inputStyle = {
  width: "100%", padding: "9px 13px", fontSize: 13,
  border: "1px solid #e2e8f0", borderRadius: 10, outline: "none",
  background: "#f8fafc", color: "#1e293b", fontFamily: "inherit",
  transition: "border-color 0.2s",
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 4, display: "block",
};
const btnPrimary = {
  padding: "8px 18px", background: BLUE_DARK, color: "#fff",
  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s",
};
const btnOutline = {
  padding: "8px 18px", background: "transparent",
  color: BLUE_1, border: `1px solid ${BLUE_1}`,
  borderRadius: 10, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
};
const btnDanger = {
  padding: "6px 12px", background: "transparent",
  color: "#dc2626", border: "1px solid #fca5a5",
  borderRadius: 8, fontSize: 12, cursor: "pointer",
  fontFamily: "inherit", transition: "all 0.2s",
};
const btnEdit = {
  padding: "6px 12px", background: "transparent",
  color: BLUE_2, border: `1px solid ${BLUE_2}`,
  borderRadius: 8, fontSize: 12, cursor: "pointer",
  fontFamily: "inherit", transition: "all 0.2s",
};
const btnSave = {
  padding: "6px 12px", background: "#16a34a",
  color: "#fff", border: "none", borderRadius: 8,
  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};
const btnCancel = {
  padding: "6px 12px", background: "#f1f5f9",
  color: "#64748b", border: "1px solid #e2e8f0",
  borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
};

/* ── Badge count ─────────────────────────────────────────────── */
const Badge = ({ count, label }) => (
  <span style={{
    background: count === 0 ? "#fee2e2" : "#dcfce7",
    color: count === 0 ? "#dc2626" : "#15803d",
    borderRadius: 20, padding: "2px 10px",
    fontSize: "0.68rem", fontWeight: 700,
  }}>
    {count} {label}{count > 1 ? "s" : ""}
  </span>
);

/* ── Modal réutilisable (même design que Login) ──────────────── */
function Modal({ title, icon, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,32,68,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)", overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{
          background: BLUE_DARK, padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{title}</span>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: 28, height: 28, borderRadius: "50%",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
          }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

const Principes = () => {
  const { backendUrl } = useContext(AppContext);
  const [principes, setPrincipes]   = useState([]);
  const [pratiques, setPratiques]   = useState([]);
  const [criteres, setCriteres]     = useState([]);
  const [openPrincipe, setOpenPrincipe] = useState(null);
  const [showAddPrincipe, setShowAddPrincipe] = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [principeId, setPrincipeId] = useState(null);
  const [pratiqueId, setPratiqueId] = useState(null);
  const [critereId, setCritereId]   = useState(null);
  const [editingPrincipeData, setEditingPrincipeData] = useState({ nom: "", description: "" });
  const [editingPratiqueData, setEditingPratiqueData] = useState({ nom: "", description: "" });
  const [editingCritereData, setEditingCritereData]   = useState({ nom: "", description: "" });
  const [openPratique, setOpenPratique]     = useState(null);
  const [showAddCritere, setShowAddCritere] = useState(false);
  const [showAddPratique, setShowAddPratique] = useState(false);
  const [selectedPrincipeId, setSelectedPrincipeId] = useState(null);
  const [selectedPratiqueId, setSelectedPratiqueId] = useState(null);
  const [newPrincipe, setNewPrincipe] = useState({ nom: "", description: "" });
  const [newPratique, setNewPratique] = useState({ nom: "", description: "" });
  const [newCritere, setNewCritere]   = useState({ nom: "", description: "" });

  const lettersOnly = (val) => val.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

  useEffect(() => { fetchPrincipes(); fetchPratiques(); fetchCriteres(); }, []);

  const handleChangeNew = e =>setNewPrincipe(p => ({ ...p, [e.target.name]: e.target.name === "nom" ? lettersOnly(e.target.value) : e.target.value }));
  const handleChangeNewPratique = e =>setNewPratique(p => ({ ...p, [e.target.name]: e.target.name === "nom" ? lettersOnly(e.target.value) : e.target.value }));
  const handleChangeNewCritere = e =>setNewCritere(p => ({ ...p, [e.target.name]: e.target.name === "nom" ? lettersOnly(e.target.value) : e.target.value }));
  
  const fetchPrincipes = async () => {
    try { const r = await axios.get(`${backendUrl}/principes`, { withCredentials: true }); setPrincipes(r.data); }
    catch (e) { console.error("Erreur chargement principes", e); }
  };
  const fetchPratiques = async () => {
    try { const r = await axios.get(`${backendUrl}/pratiques`, { withCredentials: true }); setPratiques(r.data); }
    catch (e) { console.error("Erreur chargement pratiques", e); }
  };
  const fetchCriteres = async () => {
    try { const r = await axios.get(`${backendUrl}/criteres`, { withCredentials: true }); setCriteres(r.data); }
    catch (e) { console.error("Erreur chargement criteres", e); }
  };

  const handleAddPrincipe = async (e) => {
    e.preventDefault();
    if (principes.some(p => p.nom.toLowerCase() === newPrincipe.nom.toLowerCase())) { toast.error("Ce principe existe déjà !"); return; }
    try {
      const res = await axios.post(`${backendUrl}/principes/create`, newPrincipe, { withCredentials: true });
      setPrincipes(prev => [...prev, res.data]);
      toast.success("Principe ajouté avec succès");
      setShowAddPrincipe(false);
      setNewPrincipe({ nom: "", description: "" });
    } catch (e) { toast.error("Erreur lors de l'ajout de principe"); }
  };

  const handleAddPratique = async (e) => {
    e.preventDefault();
    if (!selectedPrincipeId) return;
    const principe = principes.find(p => p.id === selectedPrincipeId);
    if (principe.pratiques?.some(p => p.nom.toLowerCase() === newPratique.nom.toLowerCase())) { toast.error("Cette pratique existe déjà !"); return; }
    try {
      const res = await axios.post(`${backendUrl}/pratiques/create/${selectedPrincipeId}`, { ...newPratique, principeId: selectedPrincipeId }, { withCredentials: true });
      setPrincipes(prev => prev.map(p => p.id === selectedPrincipeId ? { ...p, pratiques: [...(p.pratiques || []), res.data] } : p));
      toast.success("Pratique ajouté avec succès");
      setShowAddPratique(false);
      setNewPratique({ nom: "", description: "" });
    } catch (e) { toast.error("Erreur lors de l'ajout de pratique"); }
  };

  const handleAddCritere = async (e) => {
    e.preventDefault(); //prevents form submission which causes page reload and loss of state
    if (!selectedPratiqueId) return;
    try {
      const res = await axios.post(`${backendUrl}/criteres/create/${selectedPratiqueId}`, 
        { ...newCritere, pratiqueId: selectedPratiqueId },{ withCredentials: true });
      //fire a signal so any listening component knows to refetch
      window.dispatchEvent(new CustomEvent("critere-changed"));
      setPrincipes(prev => prev.map(principe => ({
        ...principe,
        pratiques: principe.pratiques?.map(pratique => pratique.id === selectedPratiqueId
          ? { ...pratique, criteres: [...(pratique.criteres || []), res.data] }
          : pratique),
      })));
      toast.success("Critère ajouté avec succès");
      setShowAddCritere(false);
      setNewCritere({ nom: "", description: "" });
    } catch (e) { toast.error("Erreur lors de l'ajout de critère"); }
  };

  const deletePrincipe = async (id) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce principe ?");
    if (!confirmed) return;
    try { await axios.delete(`${backendUrl}/principes/${id}`, { withCredentials: true }); 
    //setPrincipes(p => p.filter(d => d.id !== id)); toast.success("Principe supprimé"); 
    await fetchPrincipes();
  }
    catch { toast.error("Erreur lors de la suppression"); }
  };
  const deletePratique = async (id) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce pratique ?");
    if (!confirmed) return;
    try {
      await axios.delete(`${backendUrl}/pratiques/${id}`, { withCredentials: true });
      setPrincipes(prev => prev.map(p => ({ ...p, pratiques: p.pratiques?.filter(pr => pr.id !== id) })));
      toast.success("Pratique supprimée");
    } catch { toast.error("Erreur lors de la suppression"); }
  };
  const deleteCritere = async (id) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce critère ?");
    if (!confirmed) return;
    try {
      await axios.delete(`${backendUrl}/criteres/${id}`, { withCredentials: true });
      setPrincipes(prev => prev.map(p => ({ ...p, pratiques: p.pratiques?.map(pr => ({ ...pr, criteres: pr.criteres?.filter(c => c.id !== id) })) })));
      toast.success("Critère supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  };
  const handleCritereDeleted = () => setSyncTrigger(t => t + 1);


  const handleSave = async () => {
    if (!critereId) return toast.error("Critère non sélectionné");
    try {
      await axios.put(`${backendUrl}/criteres/update/${critereId}`, { ...editingCritereData, id: critereId }, { withCredentials: true });
      setPrincipes(prev => prev.map(p => ({ ...p, pratiques: p.pratiques?.map(pr => ({ ...pr, criteres: pr.criteres?.map(c => c.id === critereId ? { ...c, ...editingCritereData } : c) })) })));
      setIsEditing(false); setCritereId(null); toast.success("Critère mis à jour !");
    } catch { toast.error("Erreur lors de la mise à jour du critère"); }
  };
  const handleSavePrincipe = async () => {
    if (!principeId) return;
    try {
      await axios.put(`${backendUrl}/principes/update/${principeId}`, { ...editingPrincipeData, id: principeId }, { withCredentials: true });
      setPrincipes(prev => prev.map(p => p.id === principeId ? { ...p, ...editingPrincipeData } : p));
      setIsEditing(false); setPrincipeId(null); toast.success("Principe mis à jour !");
    } catch (e) { toast.error(e.response?.data?.message || "Erreur lors de la mise à jour du principe"); }
  };
  const handleSavePratique = async () => {
    try {
      await axios.put(`${backendUrl}/pratiques/update/${pratiqueId}`, { ...editingPratiqueData, id: pratiqueId }, { withCredentials: true });
      setPrincipes(prev => prev.map(p => ({ ...p, pratiques: p.pratiques?.map(pr => pr.id === pratiqueId ? { ...pr, ...editingPratiqueData } : pr) })));
      setPratiqueId(null); toast.success("Pratique mise à jour !");
    } catch (e) { toast.error(e.response?.data?.message || "Erreur lors de la mise à jour"); }
  };
  const handleCancel = () => { setIsEditing(false); };
  

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .pp-input:focus { border-color: #3b82f6 !important; background: #fff !important; outline: none; }
        .pp-btn-edit:hover   { background: #eff6ff !important; }
        .pp-btn-danger:hover { background: #fef2f2 !important; }
        .pp-btn-add:hover    { background: #f0fdf4 !important; color: #15803d !important; }
        .pp-card:hover       { box-shadow: 0 4px 20px rgba(30,58,95,0.10) !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .pp-fade { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f0f4f8" }}>

        {/* Sidebar */}
        <div style={{ width: 250, minHeight: "100vh", flexShrink: 0 }}>
          <SiderbarAdmin />
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "28px 32px" }}>

          {/* ── Page header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 28,
            background: BLUE_DARK, borderRadius: 16,
            padding: "20px 28px",
            boxShadow: "0 8px 32px rgba(30,58,95,0.18)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>📋</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                  Liste des Principes
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", marginTop: 2 }}>
                  GESTION · GOUVERNANCE
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddPrincipe(true)}
              style={{ ...btnPrimary, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", fontSize: 14 }}
            >
              + Ajouter Principe
            </button>
          </div>

          {/* ── Empty state ── */}
          {principes.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: 14, padding: "40px",
              textAlign: "center", color: "#64748b", fontSize: 14,
              border: "1px solid #e2e8f0",
            }}>
              Aucun principe disponible.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {principes.map((principe) => (
                <div
                  key={principe.id} className="pp-card pp-fade"
                  style={{
                    background: "#fff", borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(30,58,95,0.06)",
                    overflow: "hidden", transition: "box-shadow 0.2s",
                  }}
                >
                  {/* ── Principe header row ── */}
                  <div
                    style={{ padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}
                    onClick={() => setOpenPrincipe(openPrincipe === principe.id ? null : principe.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: BLUE_1 }}>{principe.nom}</span>
                        <Badge count={principe.pratiques?.length || 0} label="pratique" />
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{principe.description}</p>
                    </div>

                    {/* ── Principe edit/delete or inline edit form ── */}
                    {!isEditing || principeId !== principe.id ? (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button className="pp-btn-edit" style={btnEdit}
                          onClick={(e) => { e.stopPropagation(); setIsEditing(true); setPrincipeId(principe.id); setEditingPrincipeData({ nom: principe.nom, description: principe.description }); }}>
                          ✏️
                        </button>
                        <button onClick={e => { e.stopPropagation(); deletePrincipe(principe.id); }} title="Supprimer" style={{ ...btnDanger, padding: "6px 10px", fontSize: 11 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      /* ── ENLARGED Principe edit panel ── */
                      <div
                        style={{
                          display: "flex", flexDirection: "column", gap: 12,
                          width: "100%", maxWidth: 520,
                          background: "#f8fafc", padding: "18px 20px",
                          borderRadius: 12, border: "1px solid #cbd5e1",
                          boxShadow: "0 2px 12px rgba(30,58,95,0.08)",
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div>
                          <label style={labelStyle}>Nom du principe</label>
                          <input
                            className="pp-input"
                            style={{ ...inputStyle, fontSize: 14, padding: "10px 14px" }}
                            type="text"
                            value={editingPrincipeData.nom}
                            onChange={e => setEditingPrincipeData(p => ({ ...p, nom: lettersOnly(e.target.value) }))}
                            placeholder="Nom du principe"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Description</label>
                          <textarea
                            className="pp-input"
                            style={{ ...inputStyle, fontSize: 13, padding: "10px 14px", resize: "vertical", minHeight: 100 }}
                            rows={4}
                            value={editingPrincipeData.description}
                            onChange={e => setEditingPrincipeData(p => ({ ...p, description: e.target.value }))}
                            placeholder="Description du principe"
                          />
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button style={{ ...btnSave, padding: "9px 20px", fontSize: 13 }}
                            onClick={(e) => { e.stopPropagation(); handleSavePrincipe(); setIsEditing(false); }}>
                            Enregistrer
                          </button>
                          <button style={{ ...btnCancel, padding: "9px 20px", fontSize: 13 }}
                            onClick={(e) => { e.stopPropagation(); setIsEditing(false); setPrincipeId(null); }}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Toggle pratiques ── */}
                  <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 22px 0" }}>
                    <button
                      style={{ ...btnOutline, fontSize: 12, marginBottom: 10, padding: "6px 14px" }}
                      onClick={() => setOpenPrincipe(openPrincipe === principe.id ? null : principe.id)}
                    >
                      {openPrincipe === principe.id ? "▲ Masquer les pratiques" : "▼ Voir les pratiques"}
                    </button>

                    {openPrincipe === principe.id && (
                      <div style={{ paddingBottom: 16 }}>
                        {principe.pratiques?.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {principe.pratiques.map((pratique) => (
                              <div key={pratique.id} style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}>

                                {/* Pratique header */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                  {!isEditing || pratiqueId !== pratique.id ? (
                                    <>
                                      <span style={{ fontWeight: 700, color: BLUE_1, fontSize: 13, marginTop: 2 }}>{pratique.nom}</span>
                                      {pratique.criteres && <Badge count={pratique.criteres?.length || 0} label="critère" />}
                                      <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                                        <button className="pp-btn-edit" style={{ ...btnEdit, fontSize: 11, padding: "4px 10px" }}
                                          onClick={(e) => { e.stopPropagation(); setIsEditing(true); setPratiqueId(pratique.id); setEditingPratiqueData({ nom: pratique.nom, description: pratique.description }); }}>✏️</button>
                                        <button onClick={e => { e.stopPropagation(); deletePratique(pratique.id); }} title="Supprimer" style={{ ...btnDanger, padding: "6px 10px", fontSize: 11 }}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                                          </svg>
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    /* ── ENLARGED Pratique edit panel ── */
                                    <div
                                      style={{
                                        display: "flex", flexDirection: "column", gap: 10,
                                        width: "100%",
                                        background: "#fff", padding: "16px 18px",
                                        borderRadius: 10, border: "1px solid #cbd5e1",
                                        boxShadow: "0 2px 8px rgba(30,58,95,0.07)",
                                      }}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <div>
                                        <label style={labelStyle}>Nom de la pratique</label>
                                        <input
                                          className="pp-input"
                                          style={{ ...inputStyle, fontSize: 14, padding: "10px 14px" }}
                                          value={editingPratiqueData.nom}
                                          onChange={e => setEditingPratiqueData(p => ({ ...p, nom: lettersOnly(e.target.value) }))}
                                          placeholder="Nom de la pratique"
                                        />
                                      </div>
                                      {/*<div>
                                        <label style={labelStyle}>Description</label>
                                        <textarea
                                          className="pp-input"
                                          style={{ ...inputStyle, fontSize: 13, padding: "10px 14px", resize: "vertical", minHeight: 80 }}
                                          rows={3}
                                          value={editingPratiqueData.description}
                                          onChange={e => setEditingPratiqueData(p => ({ ...p, description: e.target.value }))}
                                          placeholder="Description de la pratique"
                                        />
                                      </div>*/}
                                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                        <button style={{ ...btnSave, padding: "8px 18px", fontSize: 13 }}
                                          onClick={(e) => { e.stopPropagation(); handleSavePratique(); setIsEditing(false); }}>
                                          Enregistrer
                                        </button>
                                        <button style={{ ...btnCancel, padding: "8px 18px", fontSize: 13 }}
                                          onClick={(e) => { e.stopPropagation(); setIsEditing(false); setPratiqueId(null); }}>
                                          Annuler
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Critères list — only show when not editing this pratique */}
                                {(!isEditing || pratiqueId !== pratique.id) && (
                                  <>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                      {pratique.criteres?.map((critere) => (
                                        <div key={critere.id} style={{
                                          display: "flex", alignItems: "center", justifyContent: "space-between",
                                          padding: "7px 12px", background: "#fff",
                                          border: "1px solid #e2e8f0", borderRadius: 8,
                                        }}>
                                          {!isEditing || critereId !== critere.id ? (
                                            <>
                                              <span style={{ fontSize: 13, color: "#334155" }}>{critere.nom}</span>
                                              <div style={{ display: "flex", gap: 6 }}>
                                                <button className="pp-btn-edit" style={{ ...btnEdit, fontSize: 11, padding: "4px 10px" }}
                                                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); setCritereId(critere.id); setEditingCritereData({ nom: critere.nom, description: critere.description }); }}>✏️</button>
                                                <button onClick={e => { e.stopPropagation(); deleteCritere(critere.id); }} title="Supprimer" style={{ ...btnDanger, padding: "6px 10px", fontSize: 11 }}>
                                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                                                  </svg>
                                                </button>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <input className="pp-input" style={{ ...inputStyle, flex: 1, marginRight: 8, padding: "6px 10px" }}
                                                value={editingCritereData.nom}
                                                onChange={e => setEditingCritereData(p => ({ ...p, nom: lettersOnly(e.target.value) }))} />
                                              <div style={{ display: "flex", gap: 6 }}>
                                                <button style={btnSave} onClick={(e) => { e.stopPropagation(); handleSave(); setIsEditing(false); }}>Enregistrer</button>
                                                <button style={btnCancel} onClick={(e) => { e.stopPropagation(); setIsEditing(false); setCritereId(null); }}>Annuler</button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Add critère link */}
                                    <button className="pp-btn-add" style={{
                                      marginTop: 8, background: "none", border: "none",
                                      color: "#16a34a", fontSize: 12, fontWeight: 700,
                                      cursor: "pointer", fontFamily: "inherit", padding: "4px 0",
                                      transition: "color 0.2s",
                                    }}
                                      onClick={(e) => { e.stopPropagation(); setShowAddCritere(true); setSelectedPratiqueId(pratique.id); }}>
                                      + Ajouter un critère
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px", background: "#f8fafc",
                            border: "1px solid #e2e8f0", borderRadius: 10,
                          }}>
                            <span style={{ color: "#94a3b8", fontSize: 13 }}>Aucune pratique existe</span>
                            <button style={{ ...btnOutline, fontSize: 12, padding: "5px 12px" }}
                              onClick={(e) => { e.stopPropagation(); setShowAddPratique(true); setSelectedPrincipeId(principe.id); }}>
                              +
                            </button>
                          </div>
                        )}

                        {/* Add pratique button */}
                        {principe.pratiques?.length > 0 && (
                          <button style={{ ...btnOutline, marginTop: 12, fontSize: 12, padding: "6px 14px" }}
                            onClick={(e) => { e.stopPropagation(); setShowAddPratique(true); setSelectedPrincipeId(principe.id); }}>
                            + Ajouter une pratique
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Ajouter Principe ── */}
      {showAddPrincipe && (
        <Modal title="Ajouter un principe" icon="📋" onClose={() => setShowAddPrincipe(false)}>
          <form onSubmit={handleAddPrincipe} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nom du principe</label>
              <input className="pp-input" style={inputStyle} type="text"
                name="nom" placeholder="Nom de principe"
                value={newPrincipe.nom} onChange={handleChangeNew} required />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea className="pp-input" style={{ ...inputStyle, resize: "none" }} rows={3}
                name="description" placeholder="Description brève du principe"
                value={newPrincipe.description} onChange={handleChangeNew} required />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" style={{ ...btnCancel, padding: "10px 20px" }} onClick={() => setShowAddPrincipe(false)}>Annuler</button>
              <button type="submit" style={{ ...btnPrimary, padding: "10px 20px" }}>Sauvegarder</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Ajouter Pratique ── */}
      {showAddPratique && (
        <Modal title="Ajouter une pratique" icon="🗂" onClose={() => setShowAddPratique(false)}>
          <form onSubmit={handleAddPratique} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nom de la pratique</label>
              <input className="pp-input" style={inputStyle} type="text"
                name="nom" placeholder="Nom de pratique"
                value={newPratique.nom} onChange={handleChangeNewPratique} required />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" style={{ ...btnCancel, padding: "10px 20px" }} onClick={() => setShowAddPratique(false)}>Annuler</button>
              <button type="submit" style={{ ...btnPrimary, padding: "10px 20px" }}>Sauvegarder</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Ajouter Critère ── */}
      {showAddCritere && (
        <Modal title="Ajouter un critère" icon="✅" onClose={() => setShowAddCritere(false)}>
          <form onSubmit={handleAddCritere} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nom du critère</label>
              <input className="pp-input" style={inputStyle} type="text"
                name="nom" placeholder="Nom de critère"
                value={newCritere.nom} onChange={handleChangeNewCritere} required />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" style={{ ...btnCancel, padding: "10px 20px" }} onClick={() => setShowAddCritere(false)}>Annuler</button>
              <button type="submit" style={{ ...btnPrimary, padding: "10px 20px" }}>Sauvegarder</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Principes;