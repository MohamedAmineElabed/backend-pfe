import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Siderbar from "../components/siderbar.jsx";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const EvaluationForm = () => {
  const location = useLocation();
  const { currentUser, evaluationId } = location.state || {};
  /*console.log("Current user passed from Evaluation:", currentUser);
  console.log("Evaluation ID:", evaluationId);*/

  const { backendUrl} = useContext(AppContext);
  const [currentEvaluationId, setCurrentEvaluationId] = useState(evaluationId);
  const [organismeId, setOrganismeId] = useState(currentUser?.organismeId || null);

  const [principes, setPrincipes] = useState([]);
  const [expandedPrincipe, setExpandedPrincipe] = useState(null);
  const [expandedPratique, setExpandedPratique] = useState({}); // object for multiple open pratiques
  const [expandedCritere, setExpandedCritere] = useState({}); // object for multiple open criteres
  const [selectedOption, setSelectedOption] = useState({});

  /*const startEvaluation = async () => {
  try {
    const res = await axios.post(`${backendUrl}/evaluation/new`, { organismeId });
    setCurrentEvaluationId(res.data); // store the new evaluation ID
  } catch (error) {
    console.error("Erreur lors de la création de l'évaluation", error);
  }
};*/

  const submitAllAnswers = async () => {
    const organismeId = currentUser?.organisme?.id;
    const responsableId=currentUser?.id;
    if (!organismeId) return alert("Organisme introuvable !");
    
    try {
      const res = await axios.post(`${backendUrl}/evaluation/new`, { organismeId,responsableId });
      const newEvaluationId=res.data;
      setCurrentEvaluationId(newEvaluationId);
      console.log("Nouvelle évaluation créée :", newEvaluationId);

      //Prepare responses array
      /*const responses = Object.entries(selectedOption).map(([critereId, valeur]) => ({
        critereId: Number(critereId),valeur,}));*/
      const payload = {
        evaluationId: newEvaluationId,   // optional if URL already has it
        reponses: Object.entries(selectedOption).map(([critereId, valeur]) => ({
        critereId: Number(critereId),
        valeur,
  })),
};

      //Save all responses
            //await axios.post(`${backendUrl}/evaluation/reponses/reponse/save/${newEvaluationId}`, payload);
      for (const [critereId, valeur] of Object.entries(selectedOption)) {
        await axios.post(`${backendUrl}/evaluation/reponses/reponse/save/${newEvaluationId}`,
        {critereId: Number(critereId),valeur: valeur,}
      );
    }
      console.log("Toutes les réponses ont été sauvegardées !");
      toast.success("Évaluation et réponses enregistrées avec succès !");
       
    } catch (err) {
      console.error("Erreur lors de la création de l'évaluation", err);
    }
  };

  const critereOptions = [
  { label: "n'existe pas", value: 1 },
  { label: "en cours", value: 2 },
  { label: "realisé", value: 3 },
  { label: "validé", value: 4 },
  ];

  // --- Fetch principes from backend ---
  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`);
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
  useEffect(() => {
    if (principes.length > 0 && expandedPrincipe === null) {
      setExpandedPrincipe(principes[0].id);
    }
  }, [principes]);

  // --- Handle critère option select ---
  const handleSelectOption = async (critereId, value) => {
    setSelectedOption((prev) => ({ ...prev, [critereId]: value }));
    /*try {
      await axios.post(`${backendUrl}/evaluation/reponse/save/${currentEvaluationId}`, { critereId, valeur: value, });
      console.log(`Critère ${critereId} saved with value "${value}"`);
      toast("success");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement", error);
    }
    if (!currentEvaluationId) return; // prevent saving without an evaluation
    try {
      await axios.post(`${backendUrl}/evaluation/reponses/reponse/save/${currentEvaluationId}`, {
        critereId,valeur: value});
        console.log(`Critère ${critereId} saved with value ${value}`);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement", error);}*/
  };
  
 
  // --- Progress calculations ---
  const getPratiqueProgress = (pratique) => {
    const total = pratique.criteres?.length || 0;
    const done = pratique.criteres?.filter((c) => selectedOption[c.id]).length;
    return `${done}/${total}`;
  };

  const getPrincipeProgress = (principe) => {
    let total = 0;
    let done = 0;
    principe.pratiques?.forEach((p) => {
      total += p.criteres?.length || 0;
      done += p.criteres?.filter((c) => selectedOption[c.id]).length;
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

  // --- Render ---
  if (!principes || principes.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        Aucun principe disponible
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",background: "#f8f9fc",
        display: "flex",fontFamily: "'DM Sans', sans-serif",
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

          {/* Submit All Button */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={submitAllAnswers}
              disabled={!allCriteresAnswered()}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: allCriteresAnswered() ? "#3b82f6" : "#cbd5e1",
                color: "#fff",
                fontWeight: 600,
                cursor: allCriteresAnswered() ? "pointer" : "not-allowed",
                marginBottom: 16,
              }}
            >
              Submit All Answers
            </button>
          </div>
        </div>

        {/* Principes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {principes.map((principe) => {
            const isPrincipeOpen = expandedPrincipe === principe.id;
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
                      <h2 style={{ fontWeight: 500, color: "#0f172a" }}>
                        {principe.nom}
                      </h2>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 20,
                          color: principe.pratiques?.length ? "#065f46" : "#b91c1c",
                          background: principe.pratiques?.length
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(244,63,94,0.1)",
                        }}
                      >
                        {getPrincipeProgress(principe)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#475569" }}>
                      {principe.description}
                    </p>
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
                                  color: pratique.criteres?.length
                                    ? "#065f46"
                                    : "#b91c1c",
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
                                          display: "flex",
                                          justifyContent: "space-between",
                                          padding: "6px 8px",
                                          marginBottom: 4,
                                          background: "#f1f5f9",
                                          borderRadius: 6,
                                          border: "1px solid #e2e8f0",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          setExpandedCritere((prev) => ({
                                            ...prev,
                                            [critere.id]: !prev[critere.id],
                                          }))
                                        }
                                      >
                                        <span style={{ color: "#0f172a" }}>
                                          {critere.nom}
                                        </span>

                                        {/* Options dropdown */}
                                        {isCritereOpen && (
                                          <div
                                            style={{
                                              marginTop: 4,
                                              display: "flex",
                                              flexDirection: "row",
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
                                                      ? "1px solid #3b82f6"
                                                      : "1px solid #cbd5e1",
                                                  background:
                                                    selectedOption[critere.id] === opt.value
                                                      ? "rgba(59,130,246,0.1)"
                                                      : "#fff",
                                                  cursor: "pointer",
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation(); // prevent collapsing
                                                  handleSelectOption(critere.id, opt.value);
                                                }}
                                              >
                                                {opt.label}
                                              </div>
                                            ))}
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
                      <div style={{ color: "#64748b", fontSize: 12 }}>
                        Aucune pratique existante
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;