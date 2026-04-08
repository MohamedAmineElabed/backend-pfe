import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Siderbar from "../components/siderbar.jsx";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { Radius } from "lucide-react";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  validé: { label: "Validé", color: "#10b981", bg: "#d1fae5", icon: "✓" },
  refusé: { label: "Refusé", color: "#b91c1c", bg: "#fee2e2", icon: "⚠" },
  en_attente: { label: "En attente", color: "#6b7280", bg: "#f3f4f6", icon: "◷" },
};

const LABEL_CONFIG = {
  Bronze: { gradient: "linear-gradient(135deg,#cd7f32,#a0522d)", text: "#fff" },
  Or: { gradient: "linear-gradient(135deg,#f5c518,#d4a017)", text: "#1a1a1a" },
  Argent: { gradient: "linear-gradient(135deg,#c0c0c0,#a8a9ad)", text: "#1a1a1a" },
};

function ScoreBar({ score}) {
  const maxScore=3;
  const pct = Math.round((score / maxScore) * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36 }}>{score}/{maxScore}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.en_attente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      color: cfg.color, background: cfg.bg,
    }}>
      <span>{cfg.icon}</span> {cfg.label}
    </span>
  );
}

function CommentBubble({ comment, evaluateur }) {
  return (
    <div style={{
      marginTop: 10,
      background: "linear-gradient(135deg,#eff6ff,#f0fdf4)",
      border: "1px solid #bfdbfe",
      borderLeft: "4px solid #3b82f6",
      borderRadius: "0 12px 12px 12px",
      padding: "14px 16px",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {/*<div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg,#3b82f6,#6366f1)",
          color: "#fff", fontSize: 10, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {evaluateur?.avatar}
        </div>*/}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af" }}>Commentaire de l'évaluateur</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>{evaluateur?.name}</div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.65, fontStyle: "italic" }}>
        « {comment} »
      </p>
    </div>
  );
}

const valeurLabels = {
  0: "n'existe pas",
  1: "en cours",
  2: "réalisé",
  3: "validé",
};

function CritereCard({ critere, evaluateur, evaluation }) {
  const [open, setOpen] = useState(false);
  const reponse = evaluation?.reponses.find(r => r.critereId === critere.id);
  const cfg = STATUS_CONFIG[reponse?.statut] || STATUS_CONFIG.pending;
  console.log("cfg: ",cfg);
  

  console.log("reponse: ", reponse);

    return (
    <div style={{
      border: `1px solid ${critere.status === "revision" ? "#fde68a" : "#e5e7eb"}`,
      borderRadius: 12,
      overflow: "hidden",
      background: "#fff",
      transition: "box-shadow 0.2s",
    }}>
      {/* Header */}
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", lineHeight: 1.5 }}>
            {critere?.nom}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <StatusBadge status={reponse?.statut} />
            {reponse?.preuves?.length >0 && (
              <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                {reponse?.preuves.map((p,index)=>{
                    if (!p?.fileUrl) return null;
                    return(
                    <a 
                    key={index} 
                    //href={`${backendUrl}/uploads/${p.cheminFichier.replace(/\\/g, "/")}`}
                    href={p.fileUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#3b82f6", textDecoration: "underline", display: "flex", alignItems: "center", gap: 4 }}>
                        📎{p?.fileName}
                    </a>)
                })}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ width: 120, marginBottom: 4 }}>
            <ScoreBar score={reponse?.valeur} maxScore />
          </div>
          <span style={{ fontSize: 18, color: "#9ca3af", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f3f4f6" }}>
          {/* Response */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Votre réponse
              <div style={{
              background: "#f9fafb", borderRadius: 8, padding: "12px 14px",
              fontSize: 13, color: "#374151", lineHeight: 1.65,
            }}>
              {valeurLabels[reponse?.valeur]}
            </div>
            </div>
            
          </div>
          {/* Comment */}
          {reponse?.commentaire && <CommentBubble comment={reponse?.commentaire} evaluateur={evaluateur} />}
          {!reponse?.commentaire && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
              Aucun commentaire pour ce critère.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/*function EvaluationCard({ evaluation, isActive, onClick }) {
  const labelCfg = evaluation.label ? LABEL_CONFIG[evaluation.label] : null;
  const statusCfg = STATUS_CONFIG[evaluation.status === "pending" ? "pending" : "validated"];

  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "16px 20px",
      background: isActive ? "linear-gradient(135deg,#eff6ff,#eef2ff)" : "#fff",
      border: `1px solid ${isActive ? "#a5b4fc" : "#e5e7eb"}`,
      borderRadius: 14, cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: isActive ? "0 0 0 2px #6366f1" : "none",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{evaluation.title}</div>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
        Soumis le {new Date(evaluation?.dateSoumission).toLocaleDateString("fr-FR")}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StatusBadge status={evaluation.status === "pending" ? "pending" : "validated"} />
        {labelCfg && (
          <span style={{
            padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800,
            background: labelCfg.gradient, color: labelCfg.text, letterSpacing: "0.06em",
          }}>
            🏅 {evaluation.label}
          </span>
        )}
        {evaluation.globalScore !== null && (
          <span style={{ fontSize: 13, fontWeight: 800, color: "#3b82f6" }}>{evaluation.globalScore}%</span>
        )}
      </div>
    </button>

  );
}
*/
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EvalFeedback() {
  const { backendUrl } = useContext(AppContext);
  const location=useLocation();
  const evId=location.state?.evaluation?.id;
  const [activeId, setActiveId] = useState(1);
  const [expandedPrincipes, setExpandedPrincipes] = useState({});
  const [expandedPratiques, setExpandedPratiques] = useState({});
  const [evaluation, setEvaluation] = useState();
  const [critereStates, setCritereStates] = useState({});
  const [principes, setPrincipes] = useState([]);
  
  

  //const active = EVALUATIONS.find((e) => e.id === activeId);

  const togglePrincipe = (id) => setExpandedPrincipes((p) => ({ ...p, [id]: !p[id] }));
  const togglePratique = (id) => setExpandedPratiques((p) => ({ ...p, [id]: !p[id] }));

  // Stats for active evaluation
  //const allCriteres = active?.principes.flatMap((p) => p.pratiques.flatMap((pr) => pr.criteres)) || [];
  
 /* const validated = allCriteres.filter((c) => c.status === "validated").length;
  const toRevise = allCriteres.filter((c) => c.status === "revision").length;
  const totalCriteres = allCriteres.length || 0;*/

  // Fetch evaluation
  useEffect(() => {
  const fetchEvaluation = async () => {
    try {
      const res = await axios.get(`${backendUrl}/evaluation/${evId}/reponses`);
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
}, [backendUrl, evId]); 

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

  //fetch only treated principes
  const treatedPrincipes = useMemo(() => {
  if (!evaluation?.reponses || !principes.length) return [];
  return principes.filter(principe => {
    const hasTreatedCritere = (principe.pratiques || []).some(pratique =>
      (pratique.criteres || []).some(critere =>
        evaluation.reponses.some(
          r => r.critereId === critere.id && (r.statut === "validé" || r.statut === "refusé")
        )
      )
    );
    
    return hasTreatedCritere;
  });
}, [principes, evaluation]);

const allCriteres = treatedPrincipes.flatMap(principe =>
  (principe.pratiques || []).flatMap(pratique =>
    pratique.criteres || []
  )
);

const validated = evaluation?.reponses.filter((r) => r.statut === "validé").length;
const refused = evaluation?.reponses.filter((r) => r.statut === "refusé").length;
const totalCriteres = allCriteres.length || 0;
    //pour tester si prncipes existes ou non
    /*useEffect(() => {
        console.log("Treated principes:", treatedPrincipes);
}, [treatedPrincipes]);*/


  return (
    <div
      style={{
        //minHeight: "100vh",
        background: "#f8f9fc",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
        {/* Sidebar */}
      <div style={{ width: 200 }}>
        <Siderbar />
      </div>
      {/*Main content */}
    <div style={{
        flex: 1,                  // take remaining space
        overflowY: "auto",
        padding: "28px 48px",     // more horizontal padding to widen main area
        background: "linear-gradient(160deg,#f8fafc 0%,#f1f5f9 60%,#e8edf5 100%)",
        minWidth: 0,              // prevent content overflow
  }}>
      {/* Top bar */}
      <div style={{
        background: "linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%)",
        padding: "0 32px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(30,58,95,0.25)",
        borderRadius:"14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🏛</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "0.01em" }}>
              Portail d'Évaluation
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.06em" }}>
              ESPACE RESPONSABLE ORGANISATIONNEL
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
         {/* <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#60a5fa,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
          }}>RO</div>*/}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
            {evaluation?.organismeName}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
         
            <>
              {/* Page header */}
              <div style={{ marginBottom: 28 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: "-0.02em" }}>
                    {}
                  </h1>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                    Soumis le {new Date(evaluation?.dateSoumission).toLocaleDateString("fr-FR")}
                    {/*{evaluation?.dateSoumission && (
                      <> · Évalué le <strong>{new Date(evaluation?.dateSoumission).toLocaleDateString("fr-FR")}</strong></>
                    )}*/}
                    {/*{active.evaluateur && (
                      <> · par <strong style={{ color: "#3b82f6" }}>{active.evaluateur.name}</strong></>
                    )}*/}
                  </div>
                </div>

                {/* Stats row */}
                {allCriteres.length > 0 && (
                  <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                    {[
                      { label: "Critères total", value: totalCriteres, color: "#6366f1", icon: "📋" },
                      { label: "Validé(s)", value: validated, color: "#10b981", icon: "✓" },
                      { label: "Refusé(s)", value: refused, color: "#b91c1c", icon: "⚠" },
                    ].map((s) => (
                      <div key={s.label} style={{
                        flex: 1, background: "#fff", borderRadius: 12, padding: "14px 18px",
                        border: "1px solid #e5e7eb",
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending state */}
              {!evaluation && (
                <div style={{
                  background: "#fff", borderRadius: 16, border: "2px dashed #d1d5db",
                  padding: "60px 40px", textAlign: "center", color: "#9ca3af",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>
                    Évaluation en cours de traitement
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Votre dossier a été soumis le {new Date(evaluation?.dateSoumission).toLocaleDateString("fr-FR")}.<br />
                    Les commentaires de l'évaluateur apparaîtront ici une fois l'évaluation complétée.
                  </div>
                </div>
              )}

              {/* Principes accordion */}
              {treatedPrincipes.map((principe,index) => (
                <div key={principe.id} style={{ marginBottom: 16 }}>
                  {/* Principe header */}
                  <button onClick={() => togglePrincipe(principe.id)} style={{
                    width: "100%", textAlign: "left", padding: "16px 20px",
                    background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
                    border: "none", borderRadius: expandedPrincipes[principe.id] ? "14px 14px 0 0" : 14,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "border-radius 0.3s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: "#fff",
                      }}>{index+1}</div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                        {principe.nom}
                      </span>
                    </div>
                    <span style={{
                      color: "rgba(255,255,255,0.8)", fontSize: 20, lineHeight: 1,
                      transform: expandedPrincipes[principe.id] ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.25s",
                      display: "inline-block",
                    }}>›</span>
                  </button>

                  {/* Pratiques */}
                  {expandedPrincipes[principe.id] && (
                    <div style={{
                      border: "1px solid #e5e7eb", borderTop: "none",
                      borderRadius: "0 0 14px 14px", overflow: "hidden",
                      background: "#f9fafb",
                    }}>
                      {principe.pratiques.map((pratique) => (
                        <div key={pratique.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          {/* Pratique toggle */}
                          <button onClick={() => togglePratique(pratique.id)} style={{
                            width: "100%", textAlign: "left", padding: "12px 20px 12px 28px",
                            background: "none", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#3b82f6",
                              }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                                {pratique.nom}
                              </span>
                              <span style={{
                                fontSize: 11, color: "#6b7280", background: "#e5e7eb",
                                padding: "2px 8px", borderRadius: 99, fontWeight: 600,
                              }}>
                                {pratique.criteres.length} critère{pratique.criteres.length > 1 ? "s" : ""}
                              </span>
                            </div>
                            <span style={{
                              color: "#9ca3af", fontSize: 16,
                              transform: expandedPratiques[pratique.id] ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.2s", display: "inline-block",
                            }}>›</span>
                          </button>

                          {/* Criteres list */}
                          {expandedPratiques[pratique.id] && (
                            <div style={{ padding: "8px 20px 16px 36px", display: "flex", flexDirection: "column", gap: 10 }}>
                              {pratique.criteres.map((critere) => (
                                <CritereCard key={critere.id} critere={critere}  evaluation={evaluation} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>

        </div>
      </div>
    </div>
    </div>
  );
}