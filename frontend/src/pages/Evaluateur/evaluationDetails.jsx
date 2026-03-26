import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import SiderbarEval from "../../components/siderbarEval.jsx";


const statusConfig = {
  validé: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Validé" },
  "en cours": { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "En cours" },
  rejeté: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Rejeté" },
  default: { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", label: "—" },
};

// Critère leaf item
// --- Critere Item ---
const CritereItem = ({ critere, index, evaluation }) => {
  const [comment, setComment] = React.useState("");
  const responsesForThisCritere = (evaluation?.reponses || []).filter(
    (r) => r.critereId === critere.id
  );

  return (
    <div style={styles.critereItem}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px", borderBottom: "0.5px solid #e2e8f0",
        background: "#f8fafc", borderRadius: "12px 12px 0 0"
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 26, height: 26, borderRadius: "50%",
          background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 500, flexShrink: 0
        }}>
          {index + 1}
        </span>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{critere.nom || "—"}</span>
      </div>

      {/* Reponses section */}
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid #e2e8f0", width:"100%" }}>
        {responsesForThisCritere.length > 0 ? (
          responsesForThisCritere.map((r, i) => (
            <div key={i} style={{ border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ padding: "12px 14px", borderBottom: "0.5px solid #e2e8f0" }}>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>Réponse du responsable</p>
                <p style={{ fontSize: 14, margin: 0 }}>{r.valeur}</p>
              </div>
              <div style={{ padding: "12px 14px", background: "#f8fafc" }}>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>Preuves jointes</p>
                {r.preuves.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {r.preuves.map((p, j) => (
                      <button key={j} href={p.fileUrl} target="_blank" rel="noopener noreferrer"
                        onClick={() => window.open(p.fileUrl, "_blank")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, color: "#3b82f6", textDecoration: "none",
                          padding: "5px 10px", border: "0.5px solid #bfdbfe",
                          borderRadius: 6, background: "#eff6ff", width: "fit-content"
                        }}>
                        📄 {p.fileName}
                      </button>
                    ))}
      {/* Evaluator comment */}
      <div style={{ padding: "16px 18px" }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          Commentaire de l'évaluateur
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Justifier votre décision..."
          style={{
            width: "100%", minHeight: 90, fontSize: 14, padding: "10px 12px",
            border: "0.5px solid #cbd5e1", borderRadius: 8,
            background: "#fff", resize: "vertical", boxSizing: "border-box",
            fontFamily: "inherit", lineHeight: 1.6, color: "inherit"
          }}
        />
      </div>
                  </div>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#94a3b8", margin: 0 }}>Aucune preuve jointe</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontStyle: "italic", color: "#94a3b8", margin: 0 }}>Aucune réponse pour ce critère.</p>
        )}
      </div>

      
    </div>
  );
};

// --- Pratique Row ---
const PratiqueRow = ({ pratique, index, evaluation }) => {
  const [open, setOpen] = useState(false);
  const criteres = pratique.criteres || [];

  return (
    <div style={styles.pratiqueWrapper}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ ...styles.pratiqueRow, background: open ? "#f0f7ff" : "#fff" }}
      >
        <div style={styles.pratiqueLeft}>
          <span style={styles.pratiqueIcon}>⚙️</span>
          <span style={styles.pratiqueText}>{pratique.nom || `Pratique ${index + 1}`}</span>
        </div>
        <div style={styles.pratiqueRight}>
          {criteres.length > 0 && (
            <span style={styles.subBadge}>{criteres.length} critère{criteres.length !== 1 ? "s" : ""}</span>
          )}
          <span style={{ ...styles.chevron, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
        </div>
      </button>

      {open && (
        <div style={styles.critereList}>
          {criteres.length ? (
            criteres.map((c, i) => (
              <CritereItem key={i} critere={c} index={i} evaluation={evaluation} />
            ))
          ) : (
            <p style={styles.emptyNested}>Aucun critère pour cette pratique.</p>
          )}
        </div>
      )}
    </div>
  );
};

// --- Principe Row ---
const PrincipeRow = ({ principe, index, evaluation }) => {
  const [open, setOpen] = useState(false);
  const pratiques = principe.pratiques || [];

  return (
    <div style={styles.principeWrapper}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ ...styles.principeRow, background: open ? "#f8faff" : "#fff" }}
      >
        <div style={styles.principeLeft}>
          <div style={styles.principeNumber}>{index + 1}</div>
          <span style={styles.principeText}>{principe.nom || `Principe ${index + 1}`}</span>
        </div>
        <div style={styles.pratiqueRight}>
          {pratiques.length > 0 && (
            <span style={styles.subBadge}>{pratiques.length} pratique{pratiques.length !== 1 ? "s" : ""}</span>
          )}
          <span style={{ ...styles.chevron, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
        </div>
      </button>

      {open && (
        <div style={styles.pratiqueList}>
          {pratiques.length ? (
            pratiques.map((p, i) => (
              <PratiqueRow key={i} pratique={p} index={i} evaluation={evaluation} />
            ))
          ) : (
            <p style={styles.emptyNested}>Aucune pratique pour ce principe.</p>
          )}
        </div>
      )}
    </div>
  );
};

// --- Evaluation Details Page ---
const EvaluationDetails = () => {
  const [principes, setPrincipes] = useState([]);
  const { state } = useLocation();
  const { evaluation: initialEval } = state || {};
  const { backendUrl } = useContext(AppContext);
  const { id } = useParams();

  const [evaluation, setEvaluation] = useState(initialEval || null);

  // Fetch evaluation
  useEffect(() => {
      const fetchEvaluation = async () => {
        try {
            const res = await axios.get(`${backendUrl}/evaluation/${id}/reponses`);
            const evalData = res.data;
            console.log(res.data);

            // Fetch organisme
          const orgRes = await axios.get(`${backendUrl}/organismes/${evalData.organismeId}`);
          const responsableRes = await axios.get(`${backendUrl}/users/${evalData.responsableId}`);


            // Map responses and proofs to frontend format
          const mappedResponses = (evalData.reponses || []).map(r => ({
            ...r,
            preuves: (r.preuves || []).map(p => ({
            fileName: p.nomFichier,
            fileUrl: `${backendUrl}/uploads/${p.nomFichier.replace(/\\/g, "/")}`
          })),
        }));
        console.log("Mapped responses:", mappedResponses);

        setEvaluation({ ...evalData, 
          reponses: mappedResponses,
          organismeName: orgRes.data.nomOrganisme,     // add name
          responsableName: responsableRes.data.nom });
        } catch (err) {
            console.error("Erreur fetching evaluation:", err);
        }
      };
        fetchEvaluation();
    }
  , [backendUrl, id]);

  // Fetch principes
  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`);
        const mappedPrincipes = res.data.map(principe => ({
          ...principe,
          label: principe.nom,
          pratiques: (principe.pratiques || []).map(p => ({
            ...p,
            label: p.nom,
            criteres: (p.criteres || []).map(c => ({ ...c, label: c.nom })),
          })),
        }));
        setPrincipes(mappedPrincipes);
      } catch (err) {
        console.error("Erreur chargement principes", err);
      }
    };
    fetchPrincipes();
  }, [backendUrl]);

  if (!evaluation) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Chargement de l'évaluation…</p>
    </div>
  );

  const statut = evaluation.statut?.toLowerCase() || "default";
  const status = statusConfig[statut] || statusConfig.default;

  const totalPratiques = principes.reduce((acc, p) => acc + (p.pratiques?.length || 0), 0);
  const totalCriteres = principes.reduce((acc, p) =>
    acc + (p.pratiques?.reduce((a, pr) => a + (pr.criteres?.length || 0), 0) || 0), 0
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ width: 300 }}>
        <SiderbarEval />
      </div>
      <div style={{ ...styles.page, margin: 0, flex: 1 }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.headerLabel}>Évaluation #{id}</p>
              <h1 style={styles.headerTitle}>{evaluation.organismeName}</h1>
            </div>
            <span style={{ ...styles.statusBadge, color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
              {status.label}
            </span>
          </div>

          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>👤</span>
              <div>
                <p style={styles.metaLabel}>Responsable</p>
                <p style={styles.metaValue}>{evaluation.responsableName || "—"}</p>
              </div>
            </div>
            <div style={styles.metaDivider} />
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>🏛️</span>
              <div>
                <p style={styles.metaLabel}>Principes</p>
                <p style={styles.metaValue}>{principes.length}</p>
              </div>
            </div>
            <div style={styles.metaDivider} />
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>⚙️</span>
              <div>
                <p style={styles.metaLabel}>Pratiques</p>
                <p style={styles.metaValue}>{totalPratiques}</p>
              </div>
            </div>
            <div style={styles.metaDivider} />
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>✅</span>
              <div>
                <p style={styles.metaLabel}>Critères</p>
                <p style={styles.metaValue}>{totalCriteres}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <span style={styles.legendItem}><span style={styles.legendDot('#3b82f6')} />Principe → </span>
          <span style={styles.legendItem}><span style={styles.legendDot('#8b5cf6')} />Pratique → </span>
          <span style={styles.legendItem}><span style={styles.legendDot('#10b981')} />Critère</span>
        </div>

        {/* Accordion */}
        <div style={styles.accordionWrap}>
          {principes.length ? (
            principes.map((p, i) => <PrincipeRow key={i} principe={p} index={i} evaluation={evaluation} />)
          ) : (
            <p style={styles.emptyTop}>Aucun principe défini pour cette évaluation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px 24px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 1000,
    margin: "0 auto",
  },
  loadingWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "60vh", gap: 16,
  },
  spinner: {
    width: 36, height: 36,
    border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#94a3b8", fontSize: 14 },
  header: {
    background: "#fff", borderRadius: 16, padding: "28px 32px",
    marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0",
  },
  headerTop: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 24, gap: 16, flexWrap: "wrap",
  },
  headerLabel: {
    fontSize: 12, color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 6px 0",
  },
  headerTitle: { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 },
  statusBadge: {
    display: "inline-block", padding: "6px 16px", borderRadius: 999,
    fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.02em",
  },
  metaRow: {
    display: "flex", gap: 0, flexWrap: "wrap",
    borderTop: "1px solid #f1f5f9", paddingTop: 20,
  },
  metaItem: { display: "flex", alignItems: "center", gap: 12, padding: "0 20px 0 0" },
  metaDivider: { width: 1, background: "#e2e8f0", margin: "0 20px 0 0", alignSelf: "stretch" },
  metaIcon: { fontSize: 18 },
  metaLabel: {
    fontSize: 11, color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: "0.07em", fontWeight: 600, margin: "0 0 2px 0",
  },
  metaValue: { fontSize: 15, color: "#1e293b", fontWeight: 600, margin: 0 },

  legend: {
    display: "flex", gap: 16, alignItems: "center",
    marginBottom: 12, padding: "0 4px",
  },
  legendItem: { fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 },
  legendDot: (color) => ({
    display: "inline-block", width: 8, height: 8,
    borderRadius: "50%", background: color,
  }),

  accordionWrap: {
    display: "flex", flexDirection: "column", gap: 8,
  },
  emptyTop: { color: "#94a3b8", fontStyle: "italic", fontSize: 14, textAlign: "center", padding: 40 },

  // Principe
  principeWrapper: {
    border: "1px solid #dbeafe", borderRadius: 12, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(59,130,246,0.07)",
  },
  principeRow: {
    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 18px", border: "none", cursor: "pointer",
    transition: "background 0.15s", textAlign: "left",
  },
  principeLeft: { display: "flex", alignItems: "center", gap: 12 },
  principeNumber: {
    width: 26, height: 26, borderRadius: "50%",
    background: "#3b82f6", color: "#fff",
    fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  principeText: { fontSize: 15, fontWeight: 600, color: "#1e3a5f" },

  // Pratique
  pratiqueList: {
    display: "flex", flexDirection: "column", gap: 1,
    background: "#f8faff", padding: "8px 12px 12px 44px",
    borderTop: "1px solid #dbeafe",
  },
  pratiqueWrapper: {
    border: "1px solid #ede9fe", borderRadius: 8, overflow: "hidden", marginBottom: 4,
  },
  pratiqueRow: {
    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 14px", border: "none", cursor: "pointer",
    transition: "background 0.15s", textAlign: "left",
  },
  pratiqueLeft: { display: "flex", alignItems: "center", gap: 10 },
  pratiqueIcon: { fontSize: 15 },
  pratiqueText: { fontSize: 14, fontWeight: 500, color: "#3b0764" },
  pratiqueRight: { display: "flex", alignItems: "center", gap: 8 },
  subBadge: {
    background: "#ede9fe", color: "#7c3aed",
    borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600,
  },
  chevron: {
    fontSize: 20, color: "#94a3b8", fontWeight: 300,
    display: "inline-block", transition: "transform 0.2s",
    lineHeight: 1,
  },

  // Critère
  critereList: {
    //background: "#f0fdf4", padding: "8px 12px 12px 44px",
    display: "flex", flexDirection: "column", gap: 6,
    borderTop: "1px solid #ede9fe",
  },
  critereItem: { display: "flex", alignItems: "center", gap: 10 },
  critereIndex: {
    width: 20, height: 20, borderRadius: 4,
    background: "#10b981", color: "#fff",
    fontSize: 10, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  critereText: { fontSize: 13, color: "#064e3b" },
  emptyNested: { fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: "4px 0" },
};

export default EvaluationDetails;