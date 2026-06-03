import { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Siderbar from "../components/siderbar.jsx";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import RecommendationEngine from "../components/recommendationEngine.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  validé:     { label: "Validé",     color: "#10b981", bg: "#d1fae5", icon: "✓" },
  refusé:     { label: "Refusé",     color: "#b91c1c", bg: "#fee2e2", icon: "⚠" },
  en_attente: { label: "En attente", color: "#6b7280", bg: "#f3f4f6", icon: "◷" },
};

const valeurLabels = {
  0: "n'existe pas",
  1: "en cours",
  2: "réalisé",
  3: "validé",
};

function ScoreBar({ score = 0 }) {
  const maxScore = 3;
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
    }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af" }}>Commentaire de l'évaluateur</div>
        <div style={{ fontSize: 10, color: "#6b7280" }}>{evaluateur?.name}</div>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.65, fontStyle: "italic" }}>
        « {comment} »
      </p>
    </div>
  );
}

function CritereCard({ critere, evaluateur, reponse, isEditing, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: "1px solid #e5e7eb",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <StatusBadge status={reponse?.statut} />
            {reponse?.preuves?.length > 0 && (
              <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {reponse.preuves.map((p, index) => {
                  if (!p?.fileUrl) return null;
                  return (
                    <a
                      key={index}
                      href={p.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 11, color: "#3b82f6", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      📎 {p?.fileName}
                    </a>
                  );
                })}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ width: 120, marginBottom: 4 }}>
            <ScoreBar score={reponse?.valeur ?? 0} />
          </div>
          <span style={{
            fontSize: 18, color: "#9ca3af", display: "inline-block",
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}>›</span>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ marginTop: 12 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#6b7280",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
            }}>
              Votre réponse
            </div>

            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select
                  value={String(reponse?.valeur ?? 0)}
                  onChange={(e) => onChange?.("valeur", Number(e.target.value))}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1px solid #d1d5db", borderRadius: 8,
                    fontSize: 13, color: "#374151", background: "#fff",
                  }}
                >
                  {Object.entries(valeurLabels).map(([v, label]) => (
                    <option key={v} value={v}>{v} — {label}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Ajouter un commentaire (optionnel)…"
                  value={reponse?.commentaire ?? ""}
                  onChange={(e) => onChange?.("commentaire", e.target.value)}
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1px solid #d1d5db", borderRadius: 8,
                    fontSize: 13, color: "#374151", resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ) : (
              <div style={{
                background: "#f9fafb", borderRadius: 8, padding: "12px 14px",
                fontSize: 13, color: "#374151", lineHeight: 1.65,
              }}>
                {valeurLabels[reponse?.valeur ?? 0]}
              </div>
            )}
          </div>

          {!isEditing && reponse?.commentaire && (
            <CommentBubble comment={reponse.commentaire} evaluateur={evaluateur} />
          )}
          {!isEditing && !reponse?.commentaire && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
              Aucun commentaire pour ce critère.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Principes accordion (reused for both tabs) ──────────────────────────────
function PrincipesAccordion({
  principes,
  reponsesByCritere,
  evaluateur,
  isEditing,
  onChangeReponse,
  emptyMessage,
}) {
  const [expandedPrincipes, setExpandedPrincipes] = useState({});
  const [expandedPratiques, setExpandedPratiques] = useState({});

  const togglePrincipe = (id) => setExpandedPrincipes((p) => ({ ...p, [id]: !p[id] }));
  const togglePratique = (id) => setExpandedPratiques((p) => ({ ...p, [id]: !p[id] }));

  if (!principes.length) {
    return (
      <div style={{
        background: "#fff", borderRadius: 16, border: "2px dashed #d1d5db",
        padding: "40px 24px", textAlign: "center", color: "#9ca3af", fontSize: 13,
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {principes.map((principe, index) => (
        <div key={principe.id} style={{ marginBottom: 16 }}>
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
              }}>{index + 1}</div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                {principe.nom}
              </span>
            </div>
            <span style={{
              color: "rgba(255,255,255,0.8)", fontSize: 20, lineHeight: 1,
              transform: expandedPrincipes[principe.id] ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.25s", display: "inline-block",
            }}>›</span>
          </button>

          {expandedPrincipes[principe.id] && (
            <div style={{
              border: "1px solid #e5e7eb", borderTop: "none",
              borderRadius: "0 0 14px 14px", overflow: "hidden",
              background: "#f9fafb",
            }}>
              {principe.pratiques.map((pratique) => (
                <div key={pratique.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <button onClick={() => togglePratique(pratique.id)} style={{
                    width: "100%", textAlign: "left", padding: "12px 20px 12px 28px",
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
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

                  {expandedPratiques[pratique.id] && (
                    <div style={{ padding: "8px 20px 16px 36px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {pratique.criteres.map((critere) => (
                        <CritereCard
                          key={critere.id}
                          critere={critere}
                          evaluateur={evaluateur}
                          reponse={reponsesByCritere.get(critere.id)}
                          isEditing={isEditing}
                          onChange={(field, value) => onChangeReponse(critere.id, field, value)}
                        />
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
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EvalEdit() {
  const { backendUrl } = useContext(AppContext);
  const location = useLocation();
  const evId = location.state?.evaluation?.id;

  const [expandedPrincipes, setExpandedPrincipes] = useState({});
  const [expandedPratiques, setExpandedPratiques] = useState({});
  const [evaluation, setEvaluation] = useState();
  const [principes, setPrincipes] = useState([]);
  const [draft, setDraft] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("treated"); // "treated" | "untreated"
  const [saving, setSaving] = useState(false);

  const isTreated = (r) => r?.statut === "validé" || r?.statut === "refusé";

  // Fetch evaluation
  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await axios.get(`${backendUrl}/evaluation/${evId}/reponses`, { withCredentials: true });
        const evalData = res.data;
        const organismeName = evalData.organisme?.nomOrganisme || "—";
        const responsableName = evalData.organisme?.responsable?.nom;
        const responsableRole = evalData.organisme?.responsable?.role;

        const mappedResponses = (evalData.reponses || []).map((r) => ({
          ...r,
          commentaireEvaluateur: r.commentaire || "",
          preuves: (r.preuves || []).map((p) => ({
            fileName: p.nomFichier,
            fileUrl: `${backendUrl}/uploads/${p.cheminFichier.replace(/\\/g, "/")}`,
          })),
        }));

        setEvaluation({
          ...evalData,
          reponses: mappedResponses,
          organismeName,
          responsableName,
          responsableRole,
        });
        setDraft(mappedResponses);
      } catch (err) {
        console.error(err);
      }
    };
    if (evId) fetchEvaluation();
  }, [backendUrl, evId]);

  // Fetch principes
  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`, { withCredentials: true });
        const mappedPrincipes = res.data.map((principe) => ({
          ...principe,
          label: principe.nom,
          pratiques: (principe.pratiques || []).map((p) => ({
            ...p,
            label: p.nom,
            criteres: (p.criteres || []).map((c) => ({ ...c, label: c.nom })),
          })),
        }));
        setPrincipes(mappedPrincipes);
      } catch (err) {
        console.error("Erreur chargement principes", err);
      }
    };
    fetchPrincipes();
  }, [backendUrl]);

  // Source of truth for the cards (draft while editing, evaluation otherwise)
  const reponsesByCritere = useMemo(() => {
    const map = new Map();
    const source = isEditing ? draft : (evaluation?.reponses || []);
    source.forEach((r) => map.set(r.critereId, r));
    return map;
  }, [evaluation, draft, isEditing]);

  // Split principes into treated / untreated
  const { treated, untreated } = useMemo(() => {
    const t = [], u = [];
    principes.forEach((principe) => {
      const hasTreated = (principe.pratiques || []).some((pr) =>
        (pr.criteres || []).some((c) => isTreated(reponsesByCritere.get(c.id)))
      );
      (hasTreated ? t : u).push(principe);
    });
    return { treated: t, untreated: u };
  }, [principes, reponsesByCritere]);

  const allCriteres = principes.flatMap((principe) =>
    (principe.pratiques || []).flatMap((pratique) => pratique.criteres || [])
  );
  const validated = evaluation?.reponses?.filter((r) => r.statut === "validé").length || 0;
  const refused = evaluation?.reponses?.filter((r) => r.statut === "refusé").length || 0;
  const totalCriteres = allCriteres.length || 0;

  // Edit handlers
  const handleStartEdit = () => {
    setDraft(evaluation?.reponses || []);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(evaluation?.reponses || []);
    setIsEditing(false);
    toast.info("Modifications annulées");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: adapt this endpoint to your backend
      await axios.put(
        `${backendUrl}/evaluation/${evId}/reponses`,
        { reponses: draft },
        { withCredentials: true }
      );
      setEvaluation((e) => ({ ...e, reponses: draft }));
      setIsEditing(false);
      toast.success("Réponses enregistrées avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeReponse = (critereId, field, value) => {
    setDraft((prev) => {
      const exists = prev.some((r) => r.critereId === critereId);
      if (exists) {
        return prev.map((r) => (r.critereId === critereId ? { ...r, [field]: value } : r));
      }
      return [
        ...prev,
        { id: `tmp-${critereId}`, critereId, valeur: 0, statut: "en_attente", [field]: value },
      ];
    });
  };

  const evaluateur = { name: evaluation?.responsableName };
  const tabPrincipes = activeTab === "treated" ? treated : untreated;

  return (
    <div style={{ background: "#f8f9fc", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 200 }}>
        <Siderbar />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 48px",
        background: "linear-gradient(160deg,#f8fafc 0%,#f1f5f9 60%,#e8edf5 100%)",
        minWidth: 0,
      }}>
        {/* Top bar */}
        <div style={{
          background: "linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%)",
          padding: "0 32px",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 16px rgba(30,58,95,0.25)",
          borderRadius: "14px",
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
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
            {evaluation?.organismeName}
          </div>
        </div>

        <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: "-0.02em" }}>
                    Évaluation
                  </h1>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                    {evaluation?.dateSoumission && (
                      <>Soumis le <strong>{new Date(evaluation.dateSoumission).toLocaleDateString("fr-FR")}</strong></>
                    )}
                  </div>
                </div>

                {/* Edit / Save / Cancel */}
                <div style={{ display: "flex", gap: 8 }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        style={{
                          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                          background: "#fff", color: "#374151", border: "1px solid #d1d5db",
                          cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                        }}
                      >
                        ✕ Annuler
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                          background: "linear-gradient(135deg,#1e3a5f,#2d5282)", color: "#fff",
                          border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                        }}
                      >
                        💾 {saving ? "Enregistrement…" : "Enregistrer"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      disabled={!evaluation}
                      style={{
                        padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: "linear-gradient(135deg,#1e3a5f,#2d5282)", color: "#fff",
                        border: "none", cursor: evaluation ? "pointer" : "not-allowed",
                        opacity: evaluation ? 1 : 0.6,
                      }}
                    >
                      ✎ Modifier les réponses
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              {totalCriteres > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  {[
                    { label: "Critères total", value: totalCriteres, color: "#6366f1", icon: "📋" },
                    { label: "Validé(s)",      value: validated,      color: "#10b981", icon: "✓" },
                    { label: "Refusé(s)",      value: refused,        color: "#b91c1c", icon: "⚠" },
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
                  Évaluation en cours de chargement
                </div>
              </div>
            )}

            {/* Tabs: Traités / Non traités */}
            {evaluation && principes.length > 0 && (
              <>
                <div style={{
                  display: "inline-flex", gap: 4, padding: 4,
                  background: "#eef2f7", borderRadius: 10, marginBottom: 20,
                }}>
                  {[
                    { key: "treated",   label: "Principes traités",     count: treated.length,   activeBg: "#10b981" },
                    { key: "untreated", label: "Principes non traités", count: untreated.length, activeBg: "#f59e0b" },
                  ].map((tab) => {
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          padding: "8px 14px", borderRadius: 8, border: "none",
                          background: active ? "#fff" : "transparent",
                          boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          fontSize: 13, fontWeight: 700,
                          color: active ? "#111827" : "#6b7280",
                          cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: 8,
                        }}
                      >
                        {tab.label}
                        <span style={{
                          fontSize: 11, fontWeight: 800,
                          background: active ? tab.activeBg : "#d1d5db",
                          color: "#fff", borderRadius: 99, padding: "1px 8px",
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <PrincipesAccordion
                  principes={tabPrincipes}
                  reponsesByCritere={reponsesByCritere}
                  evaluateur={evaluateur}
                  isEditing={isEditing}
                  onChangeReponse={handleChangeReponse}
                  emptyMessage={
                    activeTab === "treated"
                      ? "Aucun principe traité pour le moment."
                      : "Tous les principes ont été traités. Bravo !"
                  }
                />
              </>
            )}

            {/* AI Recommendations */}
            {evId && (
              <div style={{
                marginTop: 24,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: "22px 24px",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>
                  Recommandations personnalisées
                </h2>
                <RecommendationEngine
                  evaluationId={evId}
                  organismeNom={evaluation?.organismeName}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
