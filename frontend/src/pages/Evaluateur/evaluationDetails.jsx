import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import SiderbarEval from "../../components/siderbarEval.jsx";
import { toast } from "react-toastify";
import { useMemo } from "react";


const statusConfig = {
  validé: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Validé" },
  "en cours": { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "En cours" },
  rejeté: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Rejeté" },
  default: { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", label: "—" },
};
const valeurLabels = {
  0: "n'existe pas",
  1: "en cours",
  2: "réalisé",
  3: "validé",
};

// Critère leaf item
// --- Critere Item ---
const CritereItem = ({ critere, index, evaluation, onValiderCritere, onRefuserCritere, critereStates, onCommentChange, onActionSelect, isEvaluationComplete }) => {
  // Get current comment & action from global state
  const currentState = critereStates[critere.id] || {};
  const comment = currentState.comment || "";
  const selectedAction = critereStates[critere.id]?.action || null;

  const responsesForThisCritere = (evaluation?.reponses || []).filter(
    (r) => r.critereId === critere.id
  );
  const response = responsesForThisCritere[0];
  const isLocked = isEvaluationComplete || selectedAction !== null;

const handleValidateClick = () => {
  if (!comment.trim()) {
    toast.error("Le commentaire est obligatoire !");
    return;
  }
  if (!response?.id) {
    toast.error("Réponse introuvable !");
    return;
  }
  onActionSelect(critere.id, "valider");
  onValiderCritere(response.id, comment);
};
const handleRefuserClick = () => {
  if (!comment.trim()) {
    toast.error("Le commentaire est obligatoire !");
    return;
  }
  if (!response?.id) {
    toast.error("Réponse introuvable !");
    return;
  }
  onActionSelect(critere.id, "refuser");
  onRefuserCritere(response.id, comment); // call the prop
};

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
                <p style={{ fontSize: 14, margin: 0 }}>{valeurLabels[r.valeur]}</p>
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
        
        {isLocked ? (
  // RESULT BLOCK
  <div
    style={{
      marginTop: 12,
      padding: "14px 16px",
      borderRadius: 12,
      background: response.statut === "validé" ? "#ecfdf5" : "#fef2f2",
      border: `1px solid ${
        response.statut === "validé" ? "#bbf7d0" : "#fecaca"
      }`,
    }}
  >
    {/* Top row */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          padding: "4px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          background:
            response.statut === "validé" ? "#d1fae5" : "#fee2e2",
          color:
            response.statut === "validé" ? "#065f46" : "#991b1b",
        }}
      >
        {response.statut === "validé" ? "Validé" : "Refusé"}
      </span>

      <span style={{ fontSize: 14, fontWeight: 500 }}>
        <strong>Score: {response.valeur}/3</strong>
      </span>
    </div>

    {/* Comment */}
    <p style={{ marginTop: 10, fontSize: 14 }}>
      {response.commentaireEvaluateur || "—"}
    </p>
  </div>
) : (
  // EDIT MODE
  <>
    <textarea
      value={comment}
      onChange={(e) => onCommentChange(critere.id, e.target.value)}
      placeholder="Justifier votre décision..."
      style={{
        width: "100%",
        minHeight: 90,
        fontSize: 14,
        padding: "10px 12px",
        border: "0.5px solid #cbd5e1",
        borderRadius: 8,
      }}
    />

    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
      <button onClick={handleValidateClick} 
      style={{
      padding: "8px 16px",
      borderRadius: 8,
      border: "1px solid #16a34a",
      background: "#16a34a",
      color: "white",
      fontWeight: 500,
      cursor: "pointer",
      transition: "0.2s",
    }}>
        Valider
      </button>

      <button onClick={handleRefuserClick} 
      style={{
      padding: "8px 16px",
      borderRadius: 8,
      border: "1px solid #dc2626",
      background: "#dc2626",
      color: "white",
      fontWeight: 500,
      cursor: "pointer",
      transition: "0.2s",
    }}>
        Refuser
      </button>
    </div>
  </>
)}
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
const PratiqueRow = ({ pratique, index, evaluation, onValiderCritere, onRefuserCritere, critereStates, onCommentChange, onActionSelect, isEvaluationComplete}) => {
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
              <CritereItem key={i} critere={c} index={i} evaluation={evaluation} 
              onValiderCritere={onValiderCritere} onRefuserCritere={onRefuserCritere} 
              critereStates={critereStates}  onCommentChange={onCommentChange}     // <- pass handlers
              onActionSelect={onActionSelect} isEvaluationComplete={isEvaluationComplete} />
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
const PrincipeRow = ({ principe, index, evaluation, onValiderCritere, onRefuserCritere, critereStates, onCommentChange, onActionSelect, isEvaluationComplete}) => {
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
              <PratiqueRow key={i} pratique={p} index={i} evaluation={evaluation} 
              onValiderCritere={onValiderCritere} onRefuserCritere={onRefuserCritere} isEvaluationComplete={isEvaluationComplete}
              critereStates={critereStates} onCommentChange={onCommentChange} onActionSelect={onActionSelect}    />
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
  const [critereStates, setCritereStates] = useState({});
  const [evaluation, setEvaluation] = useState(initialEval || null);
  const [justCompleted, setJustCompleted] = useState(false);

  // Check if all criteria have been treated
  const allCriteres = useMemo(() => {
  if (!principes.length) return [];
  return principes.flatMap(principe =>
    (principe.pratiques || []).flatMap(pratique =>
      pratique.criteres || []
    )
  );
}, [principes]);

const isEvaluationComplete = useMemo(() => {
  if (!allCriteres.length || !evaluation?.reponses) return false;

  return allCriteres.every(c => {
    const response = evaluation.reponses.find(r => r.critereId === c.id);
    return response && (response.statut === "validé" || response.statut === "refusé");
  });
}, [allCriteres, evaluation]);

  // when user types a comment
const handleCommentChange = async (critereId, value) => {
  setCritereStates(prev => ({
    ...prev,
    [critereId]: { ...(prev[critereId] || {}), comment: value },
  }));

  /*try {
    await axios.put(`${backendUrl}/evaluation/reponses/${response.id}`, {
      comment: value,evaluationId: evaluation.id,
    });
  } catch (err) {
    toast.error("Impossible de sauvegarder le commentaire");
  }*/
};

// when user selects action
const handleActionSelect = (critereId, action) => {
  setCritereStates(prev => ({
    ...prev,
    [critereId]: {
      ...(prev[critereId] || {}),
      action,
    },
  }));
};


  // Fetch evaluation
  useEffect(() => {
  const fetchEvaluation = async () => {
    try {
      const res = await axios.get(`${backendUrl}/evaluation/${id}/reponses`);
      const evalData = res.data;
      //fetch OrganismeName
      const orgRes = await axios.get(`${backendUrl}/organismes/${evalData.organismeId}`);  
      const organismeName = orgRes.data.nomOrganisme;
      console.log("Fetched organisme:", organismeName);
      //fetch responsableName
      const resRes = await axios.get(`${backendUrl}/organismes/${evalData.organismeId}`);  
      const responsableName = resRes.data.responsable?.nom;
      const responsableRole = resRes.data.responsable?.role;
      console.log("Fetched responsable:", responsableName);
      console.log("Fetched evaluation:", evalData);

      const mappedResponses = (evalData.reponses || []).map(r => ({
        ...r,
        commentaireEvaluateur: r.commentaire || "",
        preuves: (r.preuves || []).map(p => ({
          fileName: p.nomFichier,
          fileUrl: `${backendUrl}/uploads/${p.nomFichier.replace(/\\/g, "/")}`
        })),
      }));

      // Map critereStates from response
      const states = {};
      mappedResponses.forEach(r => {
        if (r.statut) {
          states[r.critereId] = {
            comment: r.commentaireEvaluateur || "",
            action: r.statut === "validé" ? "valider" : r.statut === "refusé" ? "refuser" : null,
          };
        }
      });

      setEvaluation({ ...evalData,
                       reponses: mappedResponses,
                       organismeName,
                       responsableName,
                       responsableRole
                      });
      setCritereStates(states);
    } catch (err) {
      console.error(err);
    }
  };
  fetchEvaluation();
}, [backendUrl, id]);

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

  // Total score calculation
  const totalScore = useMemo(() => {
    if (!evaluation?.reponses) return 0;
    return evaluation.reponses
    .filter(r => r.statut !== "refusé")
    .reduce((sum, r) => sum + (r.valeur || 0), 0);
  }, [evaluation]);
  const maxScore = allCriteres.length * 3; // each critere max score is 3

  //to save score
  useEffect(() => {
  const saveScoreIfComplete = async () => {
    if (isEvaluationComplete && evaluation) {
      try {
        const response = await axios.put(
          `${backendUrl}/evaluation/${evaluation.id}/score`,
          { score: totalScore }
        );

        if (response.status === 200) {
          toast.success("Score total enregistré avec succès");
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de l'enregistrement du score automatique");
      }
    }
  };
  saveScoreIfComplete();
}, [isEvaluationComplete, totalScore, backendUrl, evaluation]);

  //valider demande
  const handleValiderCritere = async (id, comment) => {
  try {
    const response = await axios.put(
      `${backendUrl}/evaluation/reponses/${id}/valider`,
      { comment,evaluationId: evaluation.id } // send comment and score to backend
    );
    

    if (response.status === 200) {
      toast.success("Reponse validé avec succès");
      // Update frontend state immediately
      setEvaluation(prev => ({
        ...prev,
        reponses: prev.reponses.map(r =>
        r.id === id
          ? { ...r, statut: "validé", commentaireEvaluateur: comment}
          : r
  ),
}));

      // Update critereStates so locked mode shows the comment
    setCritereStates(prev => ({
      ...prev,
      [evaluation.reponses.find(r => r.id === id).critereId]: {
      ...prev[evaluation.reponses.find(r => r.id === id).critereId],
        comment,
        action: "valider",
  },
}));
    } else {
      toast.error("Erreur lors de la validation");
    }
  } catch (err) {
    toast.error("Erreur lors de la validation");
  }
};

  //valider demande
  const handleRefuserCritere = async (id, comment) => {
  try {
    const response = await axios.put(
      `${backendUrl}/evaluation/reponses/${id}/refuser`,
      { comment,evaluationId: evaluation.id, } // send comment to backend
    );

    if (response.status === 200) {
      toast.success("Reponse refusé avec succès");
      // Update frontend state immediately
      setEvaluation(prev => ({
        ...prev,
        reponses: prev.reponses.map(r =>
        r.id === id 
          ? { ...r, statut: "refusé", commentaireEvaluateur: comment }
          : r
  ),
}));

    setCritereStates(prev => ({
      ...prev,
      [evaluation.reponses.find(r => r.id === id).critereId]: {
      ...prev[evaluation.reponses.find(r => r.id === id).critereId],
        comment,
        action: "refuser",
  },
}));
    } else {
      toast.error("Erreur lors de refus");
    }
  } catch (err) {
    toast.error("Erreur lors de refus");
  }
};

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
          </div>

          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>👤</span>
              <div>
                <p style={styles.metaLabel}>Responsable</p>
                <p style={styles.metaValue}>{evaluation.responsableName || "—"}</p>
                <p style={styles.metaValue}>{evaluation.responsableRole || "—"}</p>
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
        {!isEvaluationComplete?(
        <div style={styles.accordionWrap}>
          {principes.length ? (
            principes.map((p, i) => <PrincipeRow key={i} principe={p} index={i} evaluation={evaluation} 
            onValiderCritere={handleValiderCritere} onRefuserCritere={handleRefuserCritere} isEvaluationComplete={isEvaluationComplete}
            critereStates={critereStates} onCommentChange={handleCommentChange} onActionSelect={handleActionSelect} />)
          ) : (
            <p style={styles.emptyTop}>Aucun principe défini pour cette évaluation.</p>
          )}
        </div>):(
          <div
        style={{
          marginBottom: 16,
          padding: "14px 16px",
          borderRadius: 12,
          background: "#ecfdf5",
          border: "1px solid #bbf7d0",
          color: "#065f46",
          fontWeight: 500,
        }}
      >
    Cette évaluation est terminée. Vous ne pouvez plus modifier les réponses.
    <div style={{ marginTop: 8, fontSize: 16 }}>
      Score total : <strong>{totalScore} / {maxScore}</strong>
    </div>
  </div>
        )}
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