import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Siderbar from "../components/siderbar.jsx";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useMemo } from "react";


function ProgressBar({ value, color, height = 6 }) {
  return (
    <div style={{ height, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${value}%`, borderRadius: 999,
        background: color,
        transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}


const EvaluationForm = () => {
  const location = useLocation();
  const { currentUser, evaluationId } = location.state || {};
  /*console.log("Current user passed from Evaluation:", currentUser);
  console.log("Evaluation ID:", evaluationId);*/

  const { backendUrl } = useContext(AppContext);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [currentEvaluationId, setCurrentEvaluationId] = useState(evaluationId);
  const [organismeId, setOrganismeId] = useState(currentUser?.organismeId || null);

  const [principes, setPrincipes] = useState([]);
  const [expandedPrincipe, setExpandedPrincipe] = useState(null);
  const [expandedPratique, setExpandedPratique] = useState({}); // object for multiple open pratiques
  const [expandedCritere, setExpandedCritere] = useState({}); // object for multiple open criteres
  const [selectedOption, setSelectedOption] = useState({});

  const getGlobalProgress = useMemo(() => {
  let totalCriteres = 0;
  let treatedCriteres = 0;

  principes.forEach((principe) => {
    principe.pratiques?.forEach((pratique) => {
      pratique.criteres?.forEach((c) => {
        totalCriteres += 1;
        if (selectedOption[c.id] !== undefined && selectedFiles[c.id]?.length > 0) {
          treatedCriteres += 1;
        }
      });
    });
  });

  if (totalCriteres === 0) return 0;
  return Math.round((treatedCriteres / totalCriteres) * 100);
}, [principes, selectedOption, selectedFiles]);

  /*const startEvaluation = async () => {
  try {
    const res = await axios.post(`${backendUrl}/evaluation/new`, { organismeId });
    setCurrentEvaluationId(res.data); // store the new evaluation ID
  } catch (error) {
    console.error("Erreur lors de la création de l'évaluation", error);
  }
};*/

  const submitAllAnswers = async () => {
  if (!currentUser?.organisme?.id) return alert("Organisme introuvable !");

  try {
    // --- Step 1: Create evaluation if not exists ---
    let evaluationIdToUse = currentEvaluationId;

    if (!evaluationIdToUse) {
      const res = await axios.post(`${backendUrl}/evaluation/new`, {
        organismeId: currentUser.organisme.id,
        responsableId: currentUser.id,
        //score:0,
      },{withCredentials: true});

      evaluationIdToUse = res.data?.id || res.data; // check how backend returns ID
      setCurrentEvaluationId(evaluationIdToUse);

      console.log("Nouvelle évaluation créée :", evaluationIdToUse);
    }

    // --- Step 2: Save all responses ---
        // Show loading toast immediately
      const toastId = toast.loading("Enregistrement en cours...");
      for (const [critereId, valeur] of Object.entries(selectedOption)) {
      const formData = new FormData();
      formData.append("critereId", Number(critereId));
      formData.append("valeur", valeur);

      if (selectedFiles[critereId]) {
        selectedFiles[critereId].forEach((file) => {
          formData.append("files", file);
        });
      }
      await axios.post(
        `${backendUrl}/evaluation/reponses/reponse/save/${evaluationIdToUse}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" },withCredentials: true }
      );
    }
    //without botons valider et refuser in evaluationDetails
    /*// --- Step 3: Calculate total score ---
    const totalScore = Object.values(selectedOption).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );

    // --- Step 4: Save total score ---
    await axios.put(`${backendUrl}/evaluation/${evaluationIdToUse}/score`, {
      score: totalScore,
    });*/
    //Update to success only if all requests passed
    toast.update(toastId, {
      render: "Toutes les réponses ont été enregistrés avec succès !",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
    console.log("Evaluation + score saved successfully!");
  } catch (err) {
    console.error("Erreur lors de la sauvegarde de l'évaluation", err);
    toast.update(toastId, {
      render: "Erreur lors de la sauvegarde de l'évaluation",
      type: "error",
      isLoading: false,
      autoClose: 3000,
  });
  }
};

  const critereOptions = [
  { label: "n'existe pas", value: 0, color: "#ef4444" }, // red
  { label: "en cours", value: 1, color: "#facc15" },      // yellow
  { label: "realisé", value: 2, color: "#3b82f6" },      // blue
  { label: "validé", value: 3, color: "#16a34a" },       // green
];

  // --- Fetch principes from backend ---
  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`,{withCredentials: true});
        const mappedPrincipes = res.data.map((principe) => ({
          ...principe,
          label: principe.nom,
          pratiques: (principe.pratiques || []).map((p) => ({
            ...p,
            label: p.nom,
            criteres: (p.criteres || []).map((c) => ({
              ...c,
              label: c.nom,
            })),
          })),
        }));
        setPrincipes(mappedPrincipes);
      } catch (error) {
        console.error("Erreur chargement principes", error);
      }
    };
    fetchPrincipes();
  }, [backendUrl]);

  // --- Expand first principe by default ---
  /*useEffect(() => {
    if (principes.length > 0 && expandedPrincipe === null) {
      setExpandedPrincipe(principes[0].id);
    }
  }, [principes]);*/

  // --- Handle critère option select ---
  const handleSelectOption = async (critereId, value) => {
    setSelectedOption((prev) => ({ ...prev, [critereId]: value }));
  };

  // --- Progress calculations ---
  const getPratiqueProgress = (pratique) => {
    const total = pratique.criteres?.length || 0;
    const done = pratique.criteres?.filter((c) => selectedOption[c.id] !== undefined && selectedFiles[c.id] !==undefined).length;
    return `${done}/${total}`;
  };

  const getPrincipeProgress = (principe) => {
    let total = 0;
    let done = 0;
    principe.pratiques?.forEach((p) => {
      total += p.criteres?.length || 0;
      done += p.criteres?.filter((c) => selectedOption[c.id] !== undefined && selectedFiles[c.id] !==undefined).length;
    });
    return `${done}/${total}`;
  };

  const allCriteresAnswered = () => {
    let totalCriteres = 0;
    principes.forEach((principe) =>
      principe.pratiques?.forEach((p) => {
        totalCriteres += p.criteres?.length || 0;
      })
    );
    return Object.keys(selectedOption).length === totalCriteres;
  };

  const allFilesUploaded = () => {
    let totalCriteres = 0;
    principes.forEach((principe) =>
      principe.pratiques?.forEach((p) => {
        totalCriteres += p.criteres?.length || 0;
      })
    );
    return Object.keys(selectedFiles).length === totalCriteres;
  };

  // --- Handle file input change ---
  const handleFileChange = (critereId, files) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [critereId]: [...(prev[critereId] || []), ...Array.from(files)],
    }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fc",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Sidebar */}
      <div style={{ width: 200 }}>
        <Siderbar />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "36px 40px 60px 40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {/* Header */}
          <header style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
              Liste des Principes
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Gestion des principes, pratiques et critères
            </p>
          </header>
        </div>
        {/* Progress banner */}
                <div style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  borderRadius: 16, padding: "20px 24px",
                  display: "flex", alignItems: "center", gap: 24,
                  marginBottom: 24, color: "#fff"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8, fontWeight: 500 }}>
                      Progression globale des évaluations
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${getGlobalProgress}%`, borderRadius: 999,
                        background: "#fff", transition: "width 0.8s ease"
                      }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{getGlobalProgress}%</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                      {/*{monOrganisme.evaluationsCompletes} / {userData.evaluationsTotal} évaluations*/}
                    </div>
                  </div>
                </div>
        

        {/* Principes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {principes.map((principe) => {
            const isPrincipeOpen = expandedPrincipe === principe.id;
            
            const progress = getPrincipeProgress(principe);
            const isZero = progress.startsWith("0/");
            return (
              <div
                key={principe.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e8eaf0",
                  padding: 16,
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                }}
              >
                {/* Principe Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    marginBottom: 8,
                  }}
                  onClick={() =>
                    setExpandedPrincipe(isPrincipeOpen ? null : principe.id)
                  }
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h2 style={{ fontWeight: 500, color: "#0f172a" }}>{principe.nom}</h2>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 20,
                          color: isZero ? "#b91c1c" : "#065f46",
                          background: isZero
                              ? "rgba(244,63,94,0.1)"
                              : "rgba(16,185,129,0.1)",
                        }}
                      >
                        {getPrincipeProgress(principe)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#475569" }}>{principe.description}</p>
                  </div>
                </div>

                {/* Pratiques */}
                {isPrincipeOpen && (
                  <div style={{ marginLeft: 16 }}>
                    {principe.pratiques?.length > 0 ? (
                      principe.pratiques.map((pratique) => {
                        const isPratiqueOpen = expandedPratique?.[pratique.id];
                        return (
                          <div
                            key={pratique.id}
                            style={{
                              marginBottom: 12,
                              borderLeft: "2px solid #cbd5e1",
                              paddingLeft: 12,
                            }}
                          >
                            {/* Pratique Header */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 6,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setExpandedPratique((prev) => ({
                                  ...prev,
                                  [pratique.id]: !prev[pratique.id],
                                }))
                              }
                            >
                              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                                {pratique.nom}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: 20,
                                  color: pratique.criteres?.length ? "#065f46" : "#b91c1c",
                                  background: pratique.criteres?.length
                                    ? "rgba(16,185,129,0.1)"
                                    : "rgba(244,63,94,0.1)",
                                }}
                              >
                                {getPratiqueProgress(pratique)}
                              </span>
                            </div>

                            {/* Critères */}
                            {isPratiqueOpen && (
                              <div style={{ marginLeft: 12 }}>
                                {pratique.criteres?.length > 0 ? (
                                  pratique.criteres.map((critere) => {
                                    const isCritereOpen = expandedCritere?.[critere.id];
                                    return (
                                      <div
                                        key={critere.id}
                                        style={{
                                          marginBottom: 10,
                                          padding: 10,
                                          borderRadius: 8,
                                          background: "#ffffff",
                                          border: "1px solid #e2e8f0",
                                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          setExpandedCritere((prev) => ({
                                            ...prev,
                                            [critere.id]: !prev[critere.id],
                                          }))
                                        }
                                      >
                                        <span style={{ color: "#0f172a" }}>{critere.nom}</span>

                                        {/* Options dropdown */}
                                        {isCritereOpen && (
                                          <div
                                            style={{
                                              marginTop: 10,
                                              paddingTop: 10,
                                              paddingLeft: 8,
                                              borderTop: "1px dashed #e2e8f0",
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 3,
                                            }}
                                          >
                                            {/* Options */}
                                            <div
                                              style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 4,
                                              }}
                                            >
                                              {critereOptions.map((opt) => (
                                                <div
                                                  key={opt.value}
                                                  style={{
                                                    padding: "4px 8px",
                                                    borderRadius: 6,
                                                    border:
                                                      selectedOption[critere.id] === opt.value
                                                        ? "1px solid ${opt.color}"
                                                        : "1px solid #cbd5e1",
                                                    background:
                                                      selectedOption[critere.id] === opt.value
                                                        ? "${opt.color}"
                                                        : "#fff",
                                                      color:selectedOption[critere.id] === opt.value
                                                        ? opt.color
                                                        : "#0f172a",
                                                      cursor: "pointer",
                                                  }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectOption(critere.id, opt.value);
                                                  }}
                                                >
                                                  {opt.label}
                                                </div>
                                              ))}
                                            </div>

                                            {/* File Upload */}
                                            <div style={{ marginTop: 6 }}>
                                              <input
                                                id={`file-${critere.id}`}
                                                type="file"
                                                multiple
                                                style={{ display: "none" }}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  handleFileChange(critere.id, e.target.files);
                                                }}
                                              />
                                              <label
                                                htmlFor={`file-${critere.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  gap: 6,
                                                  padding: "6px 12px",
                                                  borderRadius: 8,
                                                  border: "1px dashed #3b82f6",
                                                  background: "#eff6ff",
                                                  color: "#1d4ed8",
                                                  fontSize: 12,
                                                  fontWeight: 500,
                                                  cursor: "pointer",
                                                  transition: "0.2s",
                                                }}
                                                onMouseOver={(e) =>
                                                  (e.currentTarget.style.background = "#dbeafe")
                                                }
                                                onMouseOut={(e) =>
                                                  (e.currentTarget.style.background = "#eff6ff")
                                                }
                                              >
                                                📁 Upload file
                                              </label>

                                              {/* File preview */}
                                              {selectedFiles[critere.id]?.map((file, index) => (
                                                <div
                                                  key={index}
                                                  style={{
                                                    marginTop: 6,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    background: "#f0fdf4",
                                                    border: "1px solid #bbf7d0",
                                                    borderRadius: 8,
                                                    padding: "6px 10px",
                                                    fontSize: 12,
                                                    color: "#166534",
                                                  }}
                                                >
                                                  <span>📎 {file.name}</span>
                                                  <span
                                                    style={{
                                                      cursor: "pointer",
                                                      fontWeight: "bold",
                                                      color: "#dc2626",
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedFiles((prev) => {
                                                        const updated = { ...prev };
                                                        updated[critere.id] = updated[critere.id].filter(
                                                          (_, i) => i !== index
                                                        );
                                                        if (updated[critere.id].length === 0) {
                                                          delete updated[critere.id];
                                                        }
                                                        return updated;
                                                      });
                                                    }}
                                                  >
                                                    ✕
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div style={{ color: "#64748b", fontSize: 12 }}>
                                    Aucun critère disponible
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: "#64748b", fontSize: 12 }}>Aucune pratique existante</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {/* Submit All Button */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={submitAllAnswers}
              disabled={!allCriteresAnswered() || !allFilesUploaded()}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background:
                  allCriteresAnswered() && allFilesUploaded() ? "#3b82f6" : "#cbd5e1",
                color: "#fff",
                fontWeight: 600,
                cursor:
                  allCriteresAnswered() && allFilesUploaded() ? "pointer" : "not-allowed",
                marginBottom: 16,
              }}
            >
              Submit All Answers
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
    
  );
};

export default EvaluationForm;