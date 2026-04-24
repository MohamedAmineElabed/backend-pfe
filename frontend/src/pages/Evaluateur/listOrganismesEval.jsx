import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import SiderbarEval from "../../components/siderbarEval.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation,useNavigate } from "react-router-dom";

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
const ListOrganismesEval = () => {
  const navigate = useNavigate();

  const [organismes, setOrganismes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("tous");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);  // detail modal
  const [evalsByOrganisme, setEvalsByOrganisme] = useState({});


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

  useEffect(() => { if (backendUrl) fetchOrganismes(); }, [backendUrl]);

  useEffect(() => {
    const fetchAllEvals = async () => {
        try {
            const res = await axios.get(`${backendUrl}/evaluation/all`, { withCredentials: true });
            // Group by organisme id
            const map = {};
            res.data.forEach(ev => {
                const orgId = ev?.organismeId;
                if (!map[orgId]) map[orgId] = [];
                map[orgId].push(ev);
            });
            setEvalsByOrganisme(map);
            console.log("evals by organismes: ",map);
        } catch (err) {
            console.error(err);
        }
    };
    if (backendUrl) fetchAllEvals();
}, [backendUrl]);

  const filtered = organismes.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = (o.nomOrganisme ?? "").toLowerCase().includes(s) || (o.adresse ?? "").toLowerCase().includes(s);
    const matchType = filterType === "tous" || o.type?.toLowerCase() === filterType;
    return matchSearch && matchType;
  });

  const EvalIndicator = ({ evals = [] }) => {
    const pending = evals.filter(e =>e.status === "en attente" || e.status === "en cours" ).length;
    const total = evals.length;

    if (total === 0) return (
        <span style={{ fontSize: 11, color: T.muted, fontStyle: "italic" }}>Aucune</span>
    );

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: T.muted }}>{total} éval{total > 1 ? "s" : ""}</span>
            {pending > 0 && (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "#fef3c7", color: "#92400e",
                    border: "1px solid #fde68a",
                    borderRadius: 20, padding: "2px 8px",
                    fontSize: 11, fontWeight: 600,
                    animation: "pulse 2s infinite"
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                    {pending} nouvelle{pending > 1 ? "s" : ""}
                </span>
            )}
        </div>
    );
};

  const COLS = "44px 0.3fr 0.4fr 0.2fr 150px 100px 100px 100px 120px";
  //const COLS = "44px 80px 100px 90px 100px 75px 100px";


  return (
    <>
      <SiderbarEval />

      <div style={{ marginLeft: 220, minHeight: "100vh", background: T.bg, padding: "32px 28px", fontFamily: T.font }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>
              Liste des organismes
            </h1>
            <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
              Consultez tous les organismes enregistrés.
            </p>
          </div>
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
            {["", "Nom", "Responsable", "Évaluations", "Adresse", "Type", "Téléphone", "Fax", ""].map((h, i) => <span key={i}>{h}</span>)}
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
                //onClick={() => setSelectedOrg(org)}
                onClick={()=>{navigate("/evaluationsListe", { state: { organisme: org } });}}
                style={{ display: "grid", gridTemplateColumns: COLS, gap: 8, padding: "13px 22px", borderBottom: `1px solid ${T.border}`, alignItems: "center", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafd"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <OrgLogo url={org.logoUrl} nom={org.nomOrganisme} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{org.nomOrganisme || "—"}</div>
                  {org.secteur && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{org.secteur}</div>}
                </div>
                {/* Responsable*/}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {org.responsable ? `${org.responsable.nom} ${org.responsable.prenom}` : "—"}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.adresse || "—"}</span>
                <span style={{ fontSize: 13, color: T.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.emailOrganisme || "—"}</span>
                <TypeBadge type={org.type} />
                <span style={{ fontSize: 13, color: T.text }}>{org.telephone || "—"}</span>
                <span style={{ fontSize: 13, color: T.muted }}>{org.fax || "—"}</span>

                <EvalIndicator evals={evalsByOrganisme[org.id] || []} />
              </motion.div>
            ))
          )}

          {/* Footer */}
          <div style={{ padding: "10px 22px", fontSize: 12, color: T.label, borderTop: `1px solid ${T.border}` }}>
            {filtered.length} organisme{filtered.length !== 1 ? "s" : ""}
          </div>
        </motion.div>
      </div>      
    </>
  );
};

export default ListOrganismesEval;