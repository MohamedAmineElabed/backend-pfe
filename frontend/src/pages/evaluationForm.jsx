import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Siderbar from "../components/siderbar.jsx";
import axios from "axios";
import { Pointer } from "lucide-react";

const EvaluationForm = ({ onAnswerCritere = () => {}, onAttachPreuve = () => {} }) => {
  const { backendUrl } = useContext(AppContext);
  const [principes, setPrincipes] = useState([]);
  const [expandedPrincipe, setExpandedPrincipe] = useState(null);
  const [expandedPratique, setExpandedPratique] = useState(null);
  const [expandedCritere, setExpandedCritere] = useState({});
  const [selectedOption, setSelectedOption] = useState({});
  const critereOptions = [
  "n'existe pas",
  "en cours",
  "realisé",
  "validé"
];
  const handleSelectOption = async (critereId, value) => {
  // Update local state first
  setSelectedOption(prev => ({ ...prev, [critereId]: value }));

  try {
    // Call backend to save immediately
    await axios.post(`${backendUrl}/save-criteres`, {
      critereId,
      value,
    });
    console.log(`Critère ${critereId} saved with value "${value}"`);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement", error);
  }
};
  const getPratiqueProgress = (pratique) => {
  const total = pratique.criteres?.length || 0;
  const done = pratique.criteres?.filter(c => selectedOption[c.id]).length;
  return `${done}/${total}`;
};

const allCriteresAnswered = () => {
  let totalCriteres = 0;
  principes.forEach(principe => {
    principe.pratiques?.forEach(pratique => {
      totalCriteres += pratique.criteres?.length || 0;
    });
  });
  return Object.keys(selectedOption).length === totalCriteres;
};

const getPrincipeProgress = (principe) => {
  let total = 0;
  let done = 0;
  principe.pratiques?.forEach((p) => {
    total += p.criteres?.length || 0;
    done += p.criteres?.filter(c => selectedOption[c.id]).length;
  });
  return `${done}/${total}`;
};

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

  useEffect(() => {
    if (principes.length > 0 && expandedPrincipe === null) {
      setExpandedPrincipe(principes[0].id);
    }
  }, [principes]);

  if (!principes || principes.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        Aucun principe disponible
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 200 }}>
        <Siderbar />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "36px 40px 60px 40px" }}>
        <div style={{display: "flex",justifyContent: "space-between", alignItems: "center",marginBottom: 24,}}>
        {/* Header */}
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Liste des Principes</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Gestion des principes, pratiques et critères
          </p>

        </header>

        {/* Principes */}
        <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => alert("All critère answers submitted!")}
          disabled={!allCriteresAnswered()}
          style={{padding: "8px 16px",borderRadius: 6,border: "none",background: allCriteresAnswered() ? "#3b82f6" : "#cbd5e1",color: "#fff",
          fontWeight: 600,cursor: allCriteresAnswered() ? "pointer" : "not-allowed",marginBottom: 16,}}>
            Submit All Answers
        </button>
      </div>
      </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {principes.map((principe) => {
            const isOpen = expandedPrincipe === principe.id;
            return (
              <div key={principe.id}
                style={{background: "#fff",borderRadius: 12,border: "1px solid #e8eaf0",
                padding: 16,boxShadow: "0 1px 3px rgba(15,23,42,0.04)",}}>
                {/* Principe Header */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", marginBottom: 8 }}
                  onClick={() => setExpandedPrincipe(isOpen ? null : principe.id)}
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
                          color: principe.pratiques?.length ? "#065f46" : "#b91c1c",
                          background: principe.pratiques?.length ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                        }}
                      >
                        {/*{principe.pratiques?.length} pratique{principe.pratiques?.length > 1 ? "s" : ""}*/}
                        {getPrincipeProgress(principe)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#475569" }}>{principe.description}</p>
                  </div>
                </div>

                {/* Pratiques */}
                {isOpen && (
                  <div style={{ marginLeft: 16 }}>
                    {principe.pratiques?.length > 0 ? (
                      principe.pratiques.map((pratique) => (
                        <div key={pratique.id} style={{ marginBottom: 12, borderLeft: "2px solid #cbd5e1", paddingLeft: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{pratique.nom}</span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: 20,
                                color: pratique.criteres?.length ? "#065f46" : "#b91c1c",
                                background: pratique.criteres?.length ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                              }}
                            >
                              {/*{pratique.criteres?.length} critère{pratique.criteres?.length > 1 ? "s" : ""}*/}
                              {getPratiqueProgress(pratique)}
                            </span>
                          </div>

                          {pratique.criteres?.length > 0 ? (
                            pratique.criteres.map((critere) => (
                              
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
                                onClick={() =>setExpandedCritere(prev => ({...prev,[critere.id]: !prev[critere.id],}))
                              }>
                                <span style={{ color: "#0f172a" }}>{critere.nom}</span>
  {/* Options dropdown */}
  {expandedCritere[critere.id] && (
    <div style={{ marginTop: 4, display: "flex", flexDirection: "row", gap: 4 }}>
      {critereOptions.map((opt, idx) => (
        <div
          key={idx}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: selectedOption[critere.id] === opt ? "1px solid #3b82f6" : "1px solid #cbd5e1",
            background: selectedOption[critere.id] === opt ? "rgba(59,130,246,0.1)" : "#fff",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation(); // prevent collapsing the critere
            {handleSelectOption}
            setSelectedOption({ ...selectedOption, [critere.id]: opt});
          }}
        >
          {opt}
        </div>
      ))}
    </div>
  )}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "#64748b", fontSize: 12 }}>Aucun critère disponible</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#64748b", fontSize: 12 }}>Aucune pratique existante</div>
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