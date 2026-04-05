import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import SiderbarEval from "../../components/SiderbarEval.jsx";
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
const CritereItem = ({ critere, index, evaluation, critereStates, onCommentChange, onSaveComment }) => {
  // Get current comment & action from global state
  const currentState = critereStates[critere.id] || {};
  const comment = currentState.comment || "";
  const selectedAction = critereStates[critere.id]?.action || null;

  const responsesForThisCritere = (evaluation?.reponses || []).filter(
    (r) => r.critereId === critere.id
  );
  const response = responsesForThisCritere[0];

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
        {response ? (
  <div
    style={{
      marginTop: 12,
      padding: "14px 16px",
      borderRadius: 12,
      background: "#f8fafc", // neutral background
      border: "1px solid #e2e8f0",
    }}
  >
    {/* Score only */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
        Valeur: {response.valeur ?? 0}/3
      </span>
    </div>

    {/* Comment */}
    <p style={{ marginTop: 10, fontSize: 14, color: "#475569" }}>
      {response.commentaireEvaluateur || "Aucun commentaire"}
    </p>
    {/* Editable Comment */}
      <textarea
        value={comment}
        onChange={(e) =>
          onCommentChange(critere.id, e.target.value)
        }
        placeholder="Ajouter ou modifier le commentaire..."
        style={{
          width: "100%",
          minHeight: 90,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          outline: "none",
        }}
      />
      <button
              onClick={() => onSaveComment(critere.id)}
              style={{
                marginTop: 8,
                padding: "6px 12px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
            Enregistrer
            </button>
  </div>
) : (
  <p style={{ fontStyle: "italic", color: "#94a3b8" }}>
    Aucune réponse pour ce critère.
  </p>
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
const PratiqueRow = ({ pratique, index, evaluation, critereStates, onCommentChange, onActionSelect, isEvaluationComplete, onSaveComment}) => {
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
              critereStates={critereStates}  onCommentChange={onCommentChange}     // <- pass handlers
              onActionSelect={onActionSelect} isEvaluationComplete={isEvaluationComplete} onSaveComment={onSaveComment} />
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
const PrincipeRow = ({ principe, index, evaluation, critereStates, onCommentChange, onActionSelect, isEvaluationComplete, onSaveComment, scorePerPrincipe}) => {
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
          <span style={styles.principeText}>
            {scorePerPrincipe
  .filter(p => p.principeId === principe.id) //to get score for this principe alone
  .map(p => (
    <div key={p.principeId} style={{ marginBottom: 6 }}>
      <strong>{p.principeName}:</strong> {p.percentage}%({p.score}/{p.maxScore})
    </div>
  ))}
          </span>
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
              critereStates={critereStates} onCommentChange={onCommentChange} 
              onActionSelect={onActionSelect} onSaveComment={onSaveComment} scorePerPrincipe={scorePerPrincipe} />
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

/*
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
          fileUrl: `${backendUrl}/uploads/${p.cheminFichier.replace(/\\/g, "/")}`
        })),
      }));

      // Map critereStates from response
      const states = {};
      mappedResponses.forEach(r => {
        if (r.statut) {
          states[r.critereId] = {
            comment: r.commentaireEvaluateur || "",
            //action: r.statut === "validé" ? "valider" : r.statut === "refusé" ? "refuser" : null,
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
}, [backendUrl, id]);*/


  // Fetch evaluation
  useEffect(() => {
  const fetchEvaluation = async () => {
    try {
      const res = await axios.get(`${backendUrl}/evaluation/${id}/reponses`);
      const evalData = res.data;
      const organismeId = evalData.organisme?.id;
      const organismeName = evalData.organisme?.nomOrganisme || "—";
      console.log("Fetched organisme:", organismeName);
      const responsableName = evalData.organisme?.responsable?.nom;
      const responsableRole = evalData.organisme?.responsable?.role;
      console.log("Fetched responsable:", responsableName);
      console.log("Fetched evaluation:", evalData);

      const mappedResponses = (evalData.reponses || []).map(r => ({
        ...r,
        commentaireEvaluateur: r.commentaire || "",
        preuves: (r.preuves || []).map(p => ({
          fileName: p.nomFichier,
          fileUrl: `${backendUrl}/uploads/${p.cheminFichier.replace(/\\/g, "/")}`
        })),
      }));

      // Map critereStates from response
      const states = {};
      mappedResponses.forEach(r => {
        if (r.statut) {
          states[r.critereId] = {
            comment: r.commentaireEvaluateur || "",
            //action: r.statut === "validé" ? "valider" : r.statut === "refusé" ? "refuser" : null,
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

  //calculer score per principe
  const scorePerPrincipe = useMemo(() => {
    if (!principes.length || !evaluation?.reponses) return [];

    return principes.map(principe => {
      const pratiques = principe.pratiques || [];

      // sum all critere scores under this principe
      let principeScore = 0;
      let maxPrincipeScore = 0;

    pratiques.forEach(pratique => {
      (pratique.criteres || []).forEach(critere => {
        const response = evaluation.reponses.find(r => r.critereId === critere.id);
        if (response) {
          principeScore += response.valeur || 0;
        }
        maxPrincipeScore += 3; // each critere max 3
      });
    });

    return {
      principeId: principe.id,
      principeName: principe.nom,
      score: principeScore,
      maxScore: maxPrincipeScore,
      percentage: maxPrincipeScore ? Math.round((principeScore / maxPrincipeScore) * 100) : 0,
    };
  });
}, [principes, evaluation]);


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


  const handleSaveComment = async (critereId) => {
  try {
    const responseItem = evaluation.reponses.find(
      (r) => r.critereId === critereId
    );

    if (!responseItem) {
      toast.error("Aucune réponse trouvée pour ce critère");
      return;
    }

    const comment = critereStates[critereId]?.comment || "";
    if(!comment){
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }


    const res = await axios.put(
      `${backendUrl}/evaluation/reponses/${responseItem.id}/enregistrer`,
      {
        comment: comment,
        evaluationId: evaluation.id,
      }
    );

    if (res.status === 200) {
      toast.success("Commentaire enregistré ");

      // update UI instantly
      setEvaluation((prev) => ({
        ...prev,
        reponses: prev.reponses.map((r) =>
          r.id === responseItem.id
            ? { ...r, commentaireEvaluateur: comment }
            : r
        ),
      }));
    }
  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de la sauvegarde");
  }
};

  if (!evaluation) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Chargement de l'évaluation…</p>
    </div>
  );


  const statut = evaluation.statut?.toLowerCase() || "default";
  //const status = statusConfig[statut] || statusConfig.default;

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
            onSaveComment={handleSaveComment} isEvaluationComplete={isEvaluationComplete}
            critereStates={critereStates} onCommentChange={handleCommentChange} scorePerPrincipe={scorePerPrincipe}/>)
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


import { motion } from "framer-motion";
import { Plus, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SiderbarEval from "../../components/SiderbarEval.jsx";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import  Input  from "../../components/ui/input.jsx";
import { toast } from "react-toastify";

const STATUS = {
  en_attente: { label: "En attente", dot: "#94a3b8", text: "#475569", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
  en_cours: { label: "En cours", dot: "#f59e0b", text: "#92400e", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  //soumise: { label: "Soumise", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
  terminé: { label: "Terminé", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
};

function progressColor(pct) {
  if (pct === 100) return "#10b981";
  if (pct >= 60) return "#3b82f6";
  if (pct >= 30) return "#f59e0b";
  return "#f87171";
}

const styles = {
  page: { minHeight: "100vh", background: "#f8f9fc", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", padding: "36px 40px", maxWidth: 1200 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: 800, color: "#1e293b" },
  headerSub: { fontSize: 13, color: "#64748b" },
  newBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tableSection: { background: "#fff", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  thead: { display: "grid", gridTemplateColumns: "140px 140px 180px 180px 50px 50px 100px",columnGap: "30px", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" },
  row: { display: "grid", gridTemplateColumns: "140px 140px 180px 180px 50px 50px 100px",columnGap: "30px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center", cursor: "default" },
  orgName: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
  dateCell: { fontSize: 12, color: "#94a3b8", fontFamily: "monospace" },
  badge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em" },
  badgeDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  progressTrack: { flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },
  progressPct: { fontSize: 11, fontWeight: 700, fontFamily: "monospace", minWidth: 32, textAlign: "right" },
  arrowBtn: { width: 28, height: 28, borderRadius: 8, background: "#f8fafc", border: "1px solid #e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: "pointer" },
};

const stagger = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] } });

const EvaluationsListe = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const { backendUrl, userData } = useContext(AppContext);
  const [organismes, setOrganismes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const updateEvaluation = (id, newData) => {
  setEvaluations(prev =>
    prev.map(ev => ev.id === id ? { ...ev, ...newData } : ev)
  );
};

/*const handleProgressClick = (ev) => {
  const newProgress = Math.min((ev.progression || 0) + 10, 100); // max 100%
  updateEvaluation(ev.id, { progression: newProgress });

  // Optional: save to backend
  axios.put(`${backendUrl}/evaluation/${ev.id}`, { progress: newProgress })
    .then(res => console.log("Saved progress for", ev.id))
    .catch(err => console.error(err));
};*/

const handleStatusChange = (ev, newStatus) => {
  updateEvaluation(ev.id, { statut: newStatus });

  axios.put(`${backendUrl}/evaluation/${ev.id}`, { status: newStatus })
    .then(res => console.log("Saved status for", ev.id))
    .catch(err => console.error(err));
};

  // Fetch evaluations
  useEffect(() => {
  if (!backendUrl || !userData?.id) return;

  const fetchEvaluations = async () => {
    try {
      // Fetch evaluations with treated progression
      const resEval = await axios.get(`${backendUrl}/evaluation/all/treated`);
      // Map the response directly; no need to recalc progression in frontend
      const evalsWithProgress = resEval.data.map(ev => {
        let statutKey;
        const progression = ev.progression || 0;

        if (progression === 0) {
          statutKey = "en_attente";
        } else if (progression === 100) {
          statutKey = "terminé";
        } else {
          statutKey = "en_cours";
        }

      return {
      ...ev,
      statut: statutKey,
      score: ev.score || 0,
  };
});

      setEvaluations(evalsWithProgress);
    } catch (err) {
      console.error("Erreur fetching evaluations:", err);
    }
  };

  fetchEvaluations();
}, [backendUrl, userData]);


  // Filtered list
  const filtered = evaluations.filter(e => {
    const matchSearch = e.organismeName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "tous" || e.statut === filter;
    return matchSearch && matchFilter;
  });

  const filters = [
  { value: "tous", label: "Tous" },
  { value: "en_attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "terminé", label: "Terminé" },
];

  //pour supprimer les evaluations
  const deleteEval = async (evaluationId) => {
    /*const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?");
    if (!confirmDelete) return;*/
    try {
      await axios.delete(`${backendUrl}/evaluation/${evaluationId}`);
      setEvaluations((prev) => {
        const updated=prev.filter((e) => e.id !== evaluationId);
        return updated;});
      toast.success("Evaluation supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

  return (
    <>
      <SiderbarEval />
      <div style={{ ...styles.page, marginLeft: "200px" }}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Évaluations</h1>
            <p style={styles.headerSub}>Gérer et valider les évaluations soumises</p>
          </div>
          
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{ padding: "6px 12px", borderRadius: 6, border: filter === f.value ? "1px solid #6366f1" : "1px solid #e5e7eb", background: filter === f.value ? "#6366f1" : "#f8fafc", color: filter === f.value ? "#fff" : "#475569", cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <motion.section {...stagger(3)} style={styles.tableSection}>
          <div style={styles.tableWrap}>
            <div style={styles.thead}>
              {["Organisme", "Responsable", "Statut", "Progression", "Score", "Labelisation"].map((col, i) => <span key={i}>{col}</span>)}
            </div>

            {filtered.map((ev, idx) => {
              const cfg = STATUS[ev.statut] || { label: "Inconnu", dot: "#cbd5e1", text: "#475569", bg: "rgba(203,213,225,0.12)", border: "rgba(203,213,225,0.3)" };
              const color = progressColor(ev.progression || 0);
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + idx * 0.05 }} style={{ ...styles.row, cursor: "pointer" }}
                  onClick={() => navigate(`/evaluateur/evaluations/${ev.id}`, { state: { evaluation: ev } })}>
                  <span style={styles.orgName}>{ev.organismeName}</span>
                  {/*<span style={styles.dateCell}>{new Date(ev.dateSoumission).toLocaleDateString("fr-FR")}</span>*/}
                  <span style={styles.orgName}>{ev.responsableName}</span>
                  <span style={{ ...styles.badge, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <span style={{ ...styles.badgeDot, background: cfg.dot }} /> {cfg.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={styles.progressTrack} onClick={(e) => { e.stopPropagation(); handleProgressClick(ev); }}>
                      <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${ev.progression || 0}%` }} 
                      transition={{ duration: 0.7 }} 
                      style={{ ...styles.progressFill, background: color }} 
                      />
                    </div>
                    <span style={{ ...styles.progressPct, color }}>{ev.progression || 0}%</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color }}>{ev.score || 0}/{ev.maxScore || 0}</span>
                  <span style={styles.orgName}>{ev.label || "Non labellisé"}</span>
                  
                  <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => {e.stopPropagation();deleteEval(ev.id);}}>
                            <i className="bi bi-trash"></i>
                            </button>
                  {/*<span style={{ textAlign: "center" }}>{ev.preuves}</span>
                  <Link to={`/evaluateur/evaluations/${ev.id}`}><div style={styles.arrowBtn}><ArrowUpRight size={14} strokeWidth={2} /></div></Link>*/}
                </motion.div>
              );
            })}

            {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center" }}>Aucune évaluation trouvée.</div>}
          </div>
        </motion.section>
      </div>
    </>
  );
};

//export default EvaluationsListe;

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


