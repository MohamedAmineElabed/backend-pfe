import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import SiderbarEval from "../../components/siderbarEval.jsx";
import { toast } from "react-toastify";
import { openFile } from "../../util/fileUtils.js";

const valeurLabels = {
  0: "n'existe pas",
  1: "en cours",
  2: "réalisé",
  3: "validé",
};

const OrgLogo = ({ url, nom, size = 35 }) => {
  const initial = (nom ?? "?")[0].toUpperCase();
  const hue = (nom?.charCodeAt(0) ?? 0) * 47 % 360;
  if (url) return <img src={url} alt="logo" style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, 
    border: "1px solid #e8eaf0" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: `hsl(${hue},55%,90%)`, color: `hsl(${hue},50%,35%)`, 
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 800, flexShrink: 0 }}>
      {initial}
    </div>
  );
}



// ─── Score Panel ──────────────────────────────────────────────────────────────
const ScorePanel = ({ totalScore, scoreMax, evaluatedCount, totalCount, scorePerPrincipe, isComplete }) => {
  const pct = scoreMax > 0 ? Math.round((totalScore / scoreMax) * 100) : 0;
  const progressPct = totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;
  const scoreColor  = pct < 40 ? "#dc2626" : pct < 70 ? "#d97706" : "#16a34a";
  const scoreBg     = pct < 40 ? "#fef2f2" : pct < 70 ? "#fffbeb" : "#f0fdf4";

  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
      padding: "20px 24px", marginBottom: 18,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>

        {/* Circular score */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            border: `3px solid ${scoreColor}`,
            background: scoreBg,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{pct}%</span>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
              Score global
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "3px 0 0 0" }}>
              {totalScore}
              <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}> / {scoreMax} pts</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Progression</span>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              {evaluatedCount}/{totalCount} critères
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progressPct}%`, borderRadius: 999,
              background: isComplete ? "#16a34a" : "#3b82f6",
              transition: "width 0.4s ease",
            }} />
          </div>
          {isComplete && (
            <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
              ✓ Évaluation complète
            </p>
          )}
        </div>

        {/* Per-principe pills */}
        {scorePerPrincipe.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 320 }}>
            {scorePerPrincipe.map((sp) => {
              const c = sp.percentage < 40
                ? { bg: "#fee2e2", color: "#991b1b" }
                : sp.percentage < 70
                ? { bg: "#fef3c7", color: "#92400e" }
                : { bg: "#dcfce7", color: "#065f46" };
              return (
                <span key={sp.principeId} style={{
                  padding: "3px 10px", borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                  background: c.bg, color: c.color,
                }}>
                  {sp.principeName}: {sp.score}/{sp.maxScore}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reusable Button ──────────────────────────────────────────────────────────
const Btn = ({ onClick, variant = "ghost", children }) => {
  const variants = {
    success: {
      background: "#16a34a", color: "#fff", border: "none",
      boxShadow: "0 1px 4px rgba(22,163,74,0.25)",
    },
    danger: {
      background: "#fff", color: "#dc2626",
      border: "1.5px solid #fca5a5",
      boxShadow: "0 1px 3px rgba(220,38,38,0.08)",
    },
    warning: {
      background: "#fffbeb", color: "#92400e",
      border: "1.5px solid #fde68a",
    },
    ghost: {
      background: "#f8fafc", color: "#475569",
      border: "1.5px solid #e2e8f0",
    },
  };
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 6, padding: "8px 18px", borderRadius: 8,
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        transition: "opacity 0.15s",
        outline: "none", fontFamily: "inherit",
        ...variants[variant],
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
};

// ─── Critere Item ─────────────────────────────────────────────────────────────
const CritereItem = ({
  critere, index, evaluation,
  onValiderCritere, onRefuserCritere,
  critereStates, onCommentChange, onActionSelect,
}) => {
  const { backendUrl } = useContext(AppContext);
  const [isReEvaluating, setIsReEvaluating] = useState(false);

  const comment = critereStates[critere.id]?.comment || "";

  const responsesForThisCritere = (evaluation?.reponses || []).filter(
    (r) => r.critereId === critere.id
  );

  const displayedResponses = responsesForThisCritere.length > 0
    ? responsesForThisCritere
    : [{ id: null, critereId: critere.id, valeur: 0, statut: null, preuves: [] }];

  const response = displayedResponses[0] ?? { id: null, valeur: 0, statut: null, preuves: [] };

  const hasRealResponse = response.id !== null;
  const canBeEvaluated = response.valeur === 2 || response.valeur === 3;
  const alreadyDecided = response.statut === "validé" || response.statut === "refusé";
  const isLocked = !canBeEvaluated || (alreadyDecided && !isReEvaluating);

  const handleValidateClick = () => {
    if (!canBeEvaluated || !response?.id) { toast.error("Réponse introuvable !"); return; }
    onActionSelect(critere.id, "valider");
    onValiderCritere(response.id, comment);
    setIsReEvaluating(false);
  };

  const handleRefuserClick = () => {
    if (!canBeEvaluated || !response?.id) { toast.error("Réponse introuvable !"); return; }
    onActionSelect(critere.id, "refuser");
    onRefuserCritere(response.id, comment);
    setIsReEvaluating(false);
  };

  const headerBg =
    isReEvaluating ? "#fffbeb"
    : alreadyDecided && response.statut === "validé" ? "#f0fdf4"
    : alreadyDecided ? "#fef2f2"
    : "#f8fafc";

  const headerBorderColor =
    isReEvaluating ? "#fde68a"
    : alreadyDecided && response.statut === "validé" ? "#bbf7d0"
    : alreadyDecided ? "#fecaca"
    : "#e2e8f0";

  return (
    <div style={styles.critereItem}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: `1px solid ${headerBorderColor}`,
        background: headerBg,
        borderRadius: "12px 12px 0 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 24, height: 24, borderRadius: "50%",
            background: "#eff6ff", color: "#3b82f6", fontSize: 11, fontWeight: 700,
          }}>
            {index + 1}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
            {critere.nom || "—"}
          </span>
        </div>
        {alreadyDecided && !isReEvaluating && (
          <span style={{
            padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: response.statut === "validé" ? "#d1fae5" : "#fee2e2",
            color: response.statut === "validé" ? "#065f46" : "#991b1b",
          }}>
            {response.statut === "validé" ? "✓ Validé" : "✕ Refusé"}
          </span>
        )}
        {isReEvaluating && (
          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
            ✎ Re-évaluation en cours
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "14px 16px" }}>
        {displayedResponses.map((r, i) => (   // ← displayedResponses, pas de condition
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Réponse + preuves */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={styles.infoBox}>
                <p style={styles.infoLabel}>Réponse du responsable</p>
                <p style={styles.infoValue}>{valeurLabels[r.valeur] ?? "—"}</p>
              </div>
              <div style={styles.infoBox}>
                <p style={styles.infoLabel}>Preuves jointes</p>
                {r.preuves?.length > 0 ? (
                  r.preuves.map((p, j) => (
                    <button key={j} onClick={() => openFile(backendUrl, p.fileName)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 12, color: "#3b82f6", padding: "4px 9px",
                        border: "1px solid #bfdbfe", borderRadius: 6,
                        background: "#eff6ff", cursor: "pointer",
                        marginTop: 4, fontFamily: "inherit",
                      }}>
                      📄 {p.fileName}
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: 13, fontStyle: "italic", color: "#94a3b8", margin: 0 }}>
                    Aucune preuve
                  </p>
                )}
              </div>
            </div>

            {/* Section évaluateur */}
            <div>
              <p style={{ ...styles.infoLabel, marginBottom: 8 }}>Commentaire de l'évaluateur</p>

              {!hasRealResponse ? (
                // Pas de vraie réponse — afficher comme "n'existe pas"
                <div style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "#fef2f2", border: "1px solid #fecaca",
                  fontSize: 13, color: "#991b1b",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Score pris en compte :</span>
                    <strong style={{ color: "#1e293b" }}>0 / 3</strong>
                  </div>
                  <p style={{ margin: 0 }}>Le responsable n'a pas répondu — critère traité comme "n'existe pas".</p> 
                  {/*<p style={{ margin: 0 }}>Aucun commentaire fourni.</p>*/}
                </div>

              ) : isLocked ? (
                // Vue locked
                <div>
                  <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: response.statut === "validé" ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${response.statut === "validé" ? "#bbf7d0" : "#fecaca"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Score pris en compte :</span>
                      <strong style={{ color: "#1e293b" }}>
                        {response.statut === "validé" ? r.valeur : 0} / 3
                      </strong>
                    </div>
                    <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>
                      {r.commentaireEvaluateur || "Aucun commentaire fourni."}
                    </p>
                  </div>
                  {canBeEvaluated && (
                    <div style={{ marginTop: 10 }}>
                      <Btn variant="warning" onClick={() => {
                        setIsReEvaluating(true);
                        onCommentChange(critere.id, r.commentaireEvaluateur || "");
                      }}>
                        ✎ Re-évaluer
                      </Btn>
                    </div>
                  )}
                </div>

              ) : (
                // Vue édition
                <div>
                  {isReEvaluating && (
                    <div style={{
                      padding: "8px 12px", borderRadius: 8, marginBottom: 10,
                      background: "#fffbeb", border: "1px solid #fde68a",
                      fontSize: 12, color: "#92400e",
                    }}>
                      ⚠ Vous re-évaluez une réponse déjà traitée. La décision précédente sera écrasée.
                    </div>
                  )}
                  <textarea
                    value={comment}
                    onChange={(e) => onCommentChange(critere.id, e.target.value)}
                    placeholder="Saisir un commentaire (optionnel)…"
                    style={{
                      width: "100%", minHeight: 80, boxSizing: "border-box",
                      padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8,
                      fontSize: 13, color: "#1e293b", resize: "vertical",
                      fontFamily: "inherit", outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <Btn variant="success" onClick={handleValidateClick}>✓ Valider</Btn>
                    <Btn variant="danger" onClick={handleRefuserClick}>✕ Refuser</Btn>
                    {isReEvaluating && (
                      <Btn variant="ghost" onClick={() => setIsReEvaluating(false)}>Annuler</Btn>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}  {/* ← fermeture du .map() */}
      </div>
    </div>
  );
};

// ─── Pratique Row ─────────────────────────────────────────────────────────────
const PratiqueRow = ({
  pratique, index, evaluation,
  onValiderCritere, onRefuserCritere,
  critereStates, onCommentChange, onActionSelect,
}) => {
  const [open, setOpen] = useState(false);
  const criteres = pratique.criteres || [];

  const evaluated = criteres.filter(c => {
    const r = (evaluation?.reponses || []).find(r => r.critereId === c.id);
    return r && (r.statut === "validé" || r.statut === "refusé");
  }).length;
  const allDone = criteres.length > 0 && evaluated === criteres.length;

  return (
    <div style={styles.pratiqueWrapper}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ ...styles.pratiqueRow, background: open ? "#f5f3ff" : "#fff" }}
      >
        <div style={styles.pratiqueLeft}>
          <span style={styles.pratiqueIcon}>⚙️</span>
          <span style={styles.pratiqueText}>{pratique.nom || `Pratique ${index + 1}`}</span>
        </div>
        <div style={styles.pratiqueRight}>
          {criteres.length > 0 && (
            <span style={{
              ...styles.subBadge,
              background: allDone ? "#d1fae5" : "#ede9fe",
              color:      allDone ? "#065f46" : "#7c3aed",
            }}>
              {allDone ? "✓" : `${evaluated}/${criteres.length}`} critère{criteres.length !== 1 ? "s" : ""}
            </span>
          )}
          <span style={{ ...styles.chevron, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
        </div>
      </button>

      {open && (
        <div style={styles.critereList}>
          {criteres.length ? (
            criteres.map((c, i) => (
              <CritereItem
                key={c.id ?? i}
                critere={c}
                index={i}
                evaluation={evaluation}
                onValiderCritere={onValiderCritere}
                onRefuserCritere={onRefuserCritere}
                critereStates={critereStates}
                onCommentChange={onCommentChange}
                onActionSelect={onActionSelect}
              />
            ))
          ) : (
            <p style={styles.emptyNested}>Aucun critère pour cette pratique.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Principe Row ─────────────────────────────────────────────────────────────
const PrincipeRow = ({
  principe, index, evaluation,
  onValiderCritere, onRefuserCritere,
  critereStates, onCommentChange, onActionSelect,
  scoreData,
}) => {
  const [open, setOpen] = useState(false);
  const pratiques = principe.pratiques || [];

  const isPrincipeComplete = useMemo(() => {
    if (!evaluation?.reponses) return false;
    return pratiques.every(p =>
      (p.criteres || []).length > 0 &&
      (p.criteres || []).every(c => {
        const r = evaluation.reponses.find(r => r.critereId === c.id);
        return r && (r.statut === "validé" || r.statut === "refusé");
      })
    );
  }, [principe, evaluation]);

  const sp = scoreData?.find(s => s.principeId === principe.id);
  const pct = sp?.percentage ?? 0;

  return (
    <div style={styles.principeWrapper}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ ...styles.principeRow, background: open ? "#f0f7ff" : "#fff" }}
      >
        <div style={styles.principeLeft}>
          <div style={{
            ...styles.principeNumber,
            background: isPrincipeComplete ? "#16a34a" : "#3b82f6",
          }}>
            {isPrincipeComplete ? "✓" : index + 1}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={styles.principeText}>{principe.nom || `Principe ${index + 1}`}</span>
            {sp && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: pct < 40 ? "#dc2626" : pct < 70 ? "#d97706" : "#16a34a",
              }}>
                {sp.score}/{sp.maxScore} pts
              </span>
            )}
          </div>
        </div>
        <div style={styles.pratiqueRight}>
          {pratiques.length > 0 && (
            <span style={{
              ...styles.subBadge,
              background: isPrincipeComplete ? "#d1fae5" : "#dbeafe",
              color:      isPrincipeComplete ? "#065f46" : "#1d4ed8",
            }}>
              {pratiques.length} pratique{pratiques.length !== 1 ? "s" : ""}
            </span>
          )}
          <span style={{ ...styles.chevron, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
        </div>
      </button>

      {open && (
        <div style={styles.pratiqueList}>
          {pratiques.length ? (
            pratiques.map((p, i) => (
              <PratiqueRow
                key={p.id ?? i}
                pratique={p}
                index={i}
                evaluation={evaluation}
                onValiderCritere={onValiderCritere}
                onRefuserCritere={onRefuserCritere}
                critereStates={critereStates}
                onCommentChange={onCommentChange}
                onActionSelect={onActionSelect}
              />
            ))
          ) : (
            <p style={styles.emptyNested}>Aucune pratique pour ce principe.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Evaluation Details Page ──────────────────────────────────────────────────
const EvaluationDetails = () => {
  const [principes, setPrincipes] = useState([]);
  const { state } = useLocation();
  const { evaluation: initialEval } = state || {};
  const { backendUrl } = useContext(AppContext);
  const { id } = useParams();
  const [critereStates, setCritereStates] = useState({});
  const [evaluation, setEvaluation] = useState(initialEval || null);

  const isEvaluationComplete = evaluation?.statut === "terminé";

  const handleCommentChange = (critereId, value) =>
    setCritereStates(prev => ({ ...prev, [critereId]: { ...(prev[critereId] || {}), comment: value } }));

  const handleActionSelect = (critereId, action) =>
    setCritereStates(prev => ({ ...prev, [critereId]: { ...(prev[critereId] || {}), action } }));

  // ── Fetch evaluation ──
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${backendUrl}/evaluation/${id}/reponses`, { withCredentials: true });
        const evalData = res.data;
        const mappedResponses = (evalData.reponses || []).map(r => ({
          ...r,
          commentaireEvaluateur: r.commentaire || "",
          preuves: (r.preuves || []).map(p => ({
            fileName: p.nomFichier,
            fileUrl: `${backendUrl}/${p.cheminFichier.replace(/\\/g, "/")}`,
          })),
        }));
        const states = {};
        mappedResponses.forEach(r => {
          if (r.statut) states[r.critereId] = {
            comment: r.commentaireEvaluateur || "",
            action: r.statut === "validé" ? "valider" : r.statut === "refusé" ? "refuser" : null,
          };
        });
        setEvaluation({
          ...evalData,
          reponses: mappedResponses,
          organismeName: evalData.organisme?.nomOrganisme || "—",
          responsableName: evalData.organisme?.responsable?.nom,
          responsableRole: evalData.organisme?.responsable?.role,
        });
        setCritereStates(states);
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [backendUrl, id]);

  // ── Fetch principes ──
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`, { withCredentials: true });
        setPrincipes(res.data.map(p => ({
          ...p, label: p.nom,
          pratiques: (p.pratiques || []).map(pr => ({
            ...pr, label: pr.nom,
            criteres: (pr.criteres || []).map(c => ({ ...c, label: c.nom })),
          })),
        })));
      } catch (err) { console.error("Erreur chargement principes", err); }
    };
    fetch();
  }, [backendUrl]);

  useEffect(() => {
  const onFocus = () => {
    // Refresh principes and evaluation responses when the window regains focus
    axios.get(`${backendUrl}/principes`, { withCredentials: true })
      .then(res => setPrincipes(res.data.map(p => ({
        ...p, label: p.nom,
        pratiques: (p.pratiques || []).map(pr => ({
          ...pr, label: pr.nom,
          criteres: (pr.criteres || []).map(c => ({ ...c, label: c.nom })),
        })),
      }))));
    axios.get(`${backendUrl}/evaluation/${id}/reponses`, { withCredentials: true })
      .then(res => {
        const evalData = res.data;
        const mappedResponses = (evalData.reponses || []).map(r => ({
          ...r,
          commentaireEvaluateur: r.commentaire || "",
          preuves: (r.preuves || []).map(p => ({
            fileName: p.nomFichier,
            fileUrl: `${backendUrl}/${p.cheminFichier.replace(/\\/g, "/")}`,
          })),
        }));
        const states = {};
        mappedResponses.forEach(r => {
          if (r.statut) states[r.critereId] = {
            comment: r.commentaireEvaluateur || "",
            action: r.statut === "validé" ? "valider" : r.statut === "refusé" ? "refuser" : null,
          };
        });
        setEvaluation({
          ...evalData,
          reponses: mappedResponses,
          organismeName: evalData.organisme?.nomOrganisme || "—",
          responsableName: evalData.organisme?.responsable?.nom,
          responsableRole: evalData.organisme?.responsable?.role,
        });
        setCritereStates(states);
      });
  };
  window.addEventListener("focus", onFocus);
  return () => window.removeEventListener("focus", onFocus);
}, [backendUrl]);

  // ── On load: if evaluation is "en cours", re-fetch fresh data ──
useEffect(() => {
  if (!evaluation?.id) return;
  if (evaluation.statut === "en cours") {
    axios.get(`${backendUrl}/evaluation/${evaluation.id}/reponses`, { withCredentials: true })
      .then(r => setEvaluation(r.data))
      .catch(err => console.error("Erreur re-fetch évaluation", err));
  }
}, [evaluation?.id]); // only on mount, not on every statut change



  const validCritereIds = useMemo(() => {
  return principes.flatMap(p =>
    (p.pratiques || []).flatMap(pr =>
      (pr.criteres || []).map(c => c.id)
    )
  );
}, [principes]);

  // ── Scores ──
  /*const totalScore = useMemo(() => {
    if (!evaluation?.reponses) return 0;
    //return evaluation.reponses.filter(r => r.statut !== "refusé").reduce((s, r) => s + (r.valeur || 0), 0);
    return evaluation.reponses.reduce((sum, r) => {
      if (r.statut === "validé") return sum + (r.valeur || 0);
      if (r.statut === "refusé") return sum + 0;
      return sum;
    }, 0);
  }, [evaluation]);*/
  const totalScore = useMemo(() => {
  if (!evaluation?.reponses) return 0;

  return evaluation.reponses
    .filter(r => validCritereIds.includes(r.critereId)) 
    .reduce((sum, r) => {
      if (r.statut === "validé") return sum + (r.valeur || 0);
      return sum;
    }, 0);
}, [evaluation, validCritereIds]);
  //const maxScore=evaluation.scoreMax;
  //const maxScore = useMemo(() => (evaluation?.reponses?.length ?? 0) * 3, [evaluation]);
  /*const maxScore = useMemo(() => {
  if (!principes?.length || !evaluation?.reponses) return 0;
  // Only count critères that actually have a response in this evaluation
  const respondedCritereIds = new Set(evaluation.reponses.map(r => r.critereId));
  return principes.reduce((total, principe) => {
    return total + (principe.pratiques || []).reduce((acc, pr) => {
      const validCriteres = (pr.criteres || []).filter(c => respondedCritereIds.has(c.id));
      return acc + validCriteres.length;
    }, 0);
  }, 0) * 3;
}, [principes, evaluation?.reponses]);*/

  //always correct — derived from actual principes structure
const maxScore = useMemo(() => {
  if (!principes?.length) return 0;
  return principes.reduce((total, p) =>
    total + (p.pratiques || []).reduce((acc, pr) =>
      acc + (pr.criteres?.length || 0), 0), 0) * 3;
}, [principes]);
console.log("scoreMax: ", maxScore);


  const evaluatedCount = useMemo(() =>
    (evaluation?.reponses || []).filter(r => r.statut === "validé" || r.statut === "refusé").length,
  [evaluation]);

  const scorePerPrincipe = useMemo(() => {
    if (!principes.length || !evaluation?.reponses) return [];
    return principes.map(principe => {
      let score = 0, max = 0;
      (principe.pratiques || []).forEach(pr =>
        (pr.criteres || []).forEach(c => {
          const r = evaluation.reponses.find(r => r.critereId === c.id && r.statut === "validé");
          if (r) score += r.valeur || 0;
          max += 3;
        })
      );
      return {
        principeId: principe.id, principeName: principe.nom,
        score, maxScore: max,
        percentage: max ? Math.round((score / max) * 100) : 0,
      };
    });
  }, [principes, evaluation]);

  // ── Finalize: runs after every valider/refuser to check if evaluation is complete ──
  const checkAndFinalize = async (updatedReponses) => {
    const allDecided = updatedReponses.every(
      r => r.statut === "validé" || r.statut === "refusé"
    );
    if (!allDecided) return;

    try {
      // 1. Calculate final score from validated responses only
      const finalScore = updatedReponses
        .filter(r => r.statut === "validé")
        .reduce((sum, r) => sum + (r.valeur || 0), 0);

      // 2. Save per-principe scores
      const spData = principes.map(p => {
        let score = 0, max = 0;
        (p.pratiques || []).forEach(pr =>
          (pr.criteres || []).forEach(c => {
            const r = updatedReponses.find(r => r.critereId === c.id);
            if (r?.statut === "validé") score += r.valeur || 0;
            max += 3;
          })
        );
        return { principeId: p.id, score, maxScore: max };
      });

      await Promise.all(spData.map(sp =>
        axios.post(`${backendUrl}/scoreParPrincipe/enregistrer`, {
          evaluationId: evaluation.id,
          responsableId: evaluation.responsableId,
          organismeId: evaluation?.organisme?.id,
          principeId: sp.principeId,
          score: sp.score,
          scoreMax: sp.maxScore,
        }, { withCredentials: true })
      ));

      // 3. Save total score (backend also sets label)
      await axios.put(
        `${backendUrl}/evaluation/${evaluation.id}/score`,
        { score: finalScore },
        { withCredentials: true }
      );

      // 4. Mark as terminé
      await axios.put(
        `${backendUrl}/evaluation/${evaluation.id}/updateStatut`,
        { statut: "terminé" },
        { withCredentials: true }
      );

      // 5. Re-fetch fresh state from backend — no stale local data
      const fresh = await axios.get(
        `${backendUrl}/evaluation/${evaluation.id}/reponses`,
        { withCredentials: true }
      );
      setEvaluation(fresh.data);

    } catch (err) {
      console.error("Erreur finalisation évaluation", err);
      toast.error("Erreur lors de la finalisation");
    }
  };

  // ── Valider ──
  const handleValiderCritere = async (responseId, comment) => {
    try {
      const res = await axios.put(
        `${backendUrl}/evaluation/reponses/${responseId}/valider`,
        { comment, evaluationId: evaluation.id },
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success("Réponse validée avec succès");
        const critereId = evaluation.reponses.find(r => r.id === responseId)?.critereId;
        const updatedReponses = evaluation.reponses.map(r =>
          r.id === responseId ? { ...r, statut: "validé", commentaireEvaluateur: comment } : r
        );
        setEvaluation(prev => ({ ...prev, reponses: updatedReponses }));
        if (critereId) setCritereStates(prev => ({
          ...prev, [critereId]: { ...(prev[critereId] || {}), comment, action: "valider" },
        }));
        await checkAndFinalize(updatedReponses);
      } else { toast.error("Erreur lors de la validation"); }
    } catch { toast.error("Erreur lors de la validation"); }
  };

  // ── Refuser ──
  const handleRefuserCritere = async (responseId, comment) => {
    try {
      const res = await axios.put(
        `${backendUrl}/evaluation/reponses/${responseId}/refuser`,
        { comment, evaluationId: evaluation.id },
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success("Réponse refusée avec succès");
        const critereId = evaluation.reponses.find(r => r.id === responseId)?.critereId;
        const updatedReponses = evaluation.reponses.map(r =>
          r.id === responseId ? { ...r, statut: "refusé", commentaireEvaluateur: comment } : r
        );
        setEvaluation(prev => ({ ...prev, reponses: updatedReponses }));
        if (critereId) setCritereStates(prev => ({
          ...prev, [critereId]: { ...(prev[critereId] || {}), comment, action: "refuser" },
        }));
        await checkAndFinalize(updatedReponses);
      } else { toast.error("Erreur lors du refus"); }
    } catch { toast.error("Erreur lors du refus"); }
  };

  // ── Loading ──
  if (!evaluation) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Chargement de l'évaluation…</p>
    </div>
  );

  const totalPratiques = principes.reduce((a, p) => a + (p.pratiques?.length || 0), 0);
  const totalCriteres  = principes.reduce((a, p) =>
    a + (p.pratiques?.reduce((b, pr) => b + (pr.criteres?.length || 0), 0) || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ width: 300, flexShrink: 0 }}>
        <SiderbarEval />
      </div>

      <div style={{ ...styles.page, margin: 0, flex: 1 }}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.headerLabel}>Évaluation #{id}</p>
              {/*<OrgLogo url={evaluation.logoUrl}/>*/}
              <h1 style={styles.headerTitle}>{evaluation.organismeName}</h1>
            </div>
          </div>
          <div style={styles.metaRow}>
            {[
              { icon: "👤", label: "Responsable", value: evaluation.responsableName || "—", sub: evaluation.responsableRole || null },
              { icon: "🏛️", label: "Principes",   value: principes.length },
              { icon: "⚙️", label: "Pratiques",   value: totalPratiques },
              { icon: "✅", label: "Critères",    value: totalCriteres },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <div style={styles.metaItem}>
                  <span style={styles.metaIcon}>{item.icon}</span>
                  <div>
                    <p style={styles.metaLabel}>{item.label}</p>
                    <p style={styles.metaValue}>{item.value}</p>
                    {item.sub && <p style={{ ...styles.metaValue, fontSize: 11, color: "#64748b", fontWeight: 400 }}>{item.sub}</p>}
                  </div>
                </div>
                {i < arr.length - 1 && <div style={styles.metaDivider} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Score Panel ── */}
        <ScorePanel
          totalScore={totalScore}
          scoreMax={maxScore}
          evaluatedCount={evaluatedCount}
          totalCount={evaluation.reponses?.length ?? 0}
          scorePerPrincipe={scorePerPrincipe}
          isComplete={isEvaluationComplete}
        />

        {/* ── Legend ── */}
        <div style={styles.legend}>
          {[["#3b82f6","Principe"],["#8b5cf6","Pratique"],["#10b981","Critère"]].map(([color, label], i, arr) => (
            <span key={label} style={styles.legendItem}>
              <span style={styles.legendDot(color)} />
              {label}
              {i < arr.length - 1 && <span style={{ color: "#cbd5e1", marginLeft: 4 }}>→</span>}
            </span>
          ))}
        </div>

        {/* ── Accordion ── */}
        <div style={styles.accordionWrap}>
          {principes.length ? (
            principes.map((p, i) => (
              <PrincipeRow
                key={p.id ?? i}
                principe={p}
                index={i}
                evaluation={evaluation}
                onValiderCritere={handleValiderCritere}
                onRefuserCritere={handleRefuserCritere}
                isEvaluationComplete={isEvaluationComplete}
                critereStates={critereStates}
                onCommentChange={handleCommentChange}
                onActionSelect={handleActionSelect}
                scoreData={scorePerPrincipe}
              />
            ))
          ) : (
            <p style={styles.emptyTop}>Aucun principe défini pour cette évaluation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh", background: "#f8fafc",
    padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 1000,
  },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 },
  spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#94a3b8", fontSize: 14 },
  header: { background: "#fff", borderRadius: 16, padding: "24px 28px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" },
  headerLabel: { fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 4px 0" },
  headerTitle: { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 },
  metaRow: { display: "flex", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: 18, alignItems: "center" },
  metaItem: { display: "flex", alignItems: "center", gap: 10, padding: "0 18px 0 0" },
  metaDivider: { width: 1, background: "#e2e8f0", margin: "0 18px 0 0", alignSelf: "stretch", minHeight: 36 },
  metaIcon: { fontSize: 18 },
  metaLabel: { fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, margin: "0 0 2px 0" },
  metaValue: { fontSize: 14, color: "#1e293b", fontWeight: 600, margin: 0 },
  legend: { display: "flex", gap: 14, alignItems: "center", marginBottom: 12, padding: "0 2px" },
  legendItem: { fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 },
  legendDot: (color) => ({ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color }),
  accordionWrap: { display: "flex", flexDirection: "column", gap: 8 },
  emptyTop: { color: "#94a3b8", fontStyle: "italic", fontSize: 14, textAlign: "center", padding: 40 },
  principeWrapper: { border: "1px solid #dbeafe", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(59,130,246,0.07)" },
  principeRow: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", border: "none", cursor: "pointer", transition: "background 0.15s", textAlign: "left" },
  principeLeft: { display: "flex", alignItems: "center", gap: 12 },
  principeNumber: { width: 26, height: 26, borderRadius: "50%", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" },
  principeText: { fontSize: 15, fontWeight: 600, color: "#1e3a5f" },
  pratiqueList: { display: "flex", flexDirection: "column", gap: 4, background: "#f8faff", padding: "8px 12px 12px 44px", borderTop: "1px solid #dbeafe" },
  pratiqueWrapper: { border: "1px solid #ede9fe", borderRadius: 8, overflow: "hidden", marginBottom: 2 },
  pratiqueRow: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "none", cursor: "pointer", transition: "background 0.15s", textAlign: "left" },
  pratiqueLeft: { display: "flex", alignItems: "center", gap: 10 },
  pratiqueIcon: { fontSize: 14 },
  pratiqueText: { fontSize: 14, fontWeight: 500, color: "#3b0764" },
  pratiqueRight: { display: "flex", alignItems: "center", gap: 8 },
  subBadge: { borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 600 },
  chevron: { fontSize: 20, color: "#94a3b8", fontWeight: 300, display: "inline-block", transition: "transform 0.2s", lineHeight: 1 },
  critereList: { display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px 10px", borderTop: "1px solid #ede9fe", background: "#fafafa" },
  critereItem: { display: "block", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  emptyNested: { fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: "4px 0" },
  infoBox: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" },
  infoValue: { fontSize: 13, color: "#1e293b", fontWeight: 500, margin: 0 },
};

export default EvaluationDetails;