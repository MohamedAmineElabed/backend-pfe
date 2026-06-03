import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
//import SiderbarAdmin from "../../components/siderbarAdmin";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

export default function RecommendationEngine({ evaluationId, nomOrganisme }) {
  const { backendUrl} = useContext(AppContext);
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [cached,  setCached]  = useState(false);

  const generate = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await axios.post(`${backendUrl}/recommendations/${evaluationId}`,{},{withCredentials: true});
    let data = res.data;

    //Ensure string
    if (typeof data !== "string") {
      setReport(data);
      return;
    }

    //Remove markdown safely
    const cleaned = data
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    //Extract ONLY JSON (ultra robust)
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No valid JSON found in response");
    }

    const jsonString = cleaned.substring(jsonStart, jsonEnd + 1);

    //STEP 4: Parse safely
    const report = JSON.parse(jsonString);

    setCached(false);
    setReport(report);

  } catch (err) {
    console.error("FULL ERROR:", err);
    console.log("RAW RESPONSE:", err.response?.data);
    setError("Erreur lors de la génération. Veuillez réessayer.");
  } finally {
    setLoading(false);
  }
};

  const regenerate = async () => {
    try {
        // 1. Vider le cache
        await axios.delete(
            `${backendUrl}/recommendations/${evaluationId}/cache`,
            { withCredentials: true }
        );
        setReport(null);
        setCached(false);

        // 2. Regénérer — generate() gère son propre loading/error
        await generate();

    } catch(err) {
        console.error(err);
        console.log(err.response?.data);
        setError("Erreur lors de la régénération. Veuillez réessayer.");
        setLoading(false); // ← sécurité si le DELETE échoue
    }
};

  return (
    <div className="card shadow-sm p-4 mt-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          Recommandations AI
          {cached && (
            <span className="badge bg-secondary ms-2" style={{ fontSize: "11px" }}>
              depuis le cache
            </span>
          )}
        </h5>
        {report && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={regenerate}
            disabled={loading}
          >
            Régénérer
          </button>
        )}
      </div>

      {!report && (
        <button
          className="btn btn-outline-primary w-100"
          onClick={generate}
          disabled={loading}
        >
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2"/>Analyse en cours...</>
            : "Générer les recommandations AI"
          }
        </button>
      )}

      {error && <div className="alert alert-danger mt-3 small">{error}</div>}

      {report && (
        <div className="mt-3">
          <Section title="Points forts"       color="success" items={report.points_forts} />
          <Section title="Lacunes prioritaires" color="warning" items={report.lacunes}    />
          <Section title="Plan d'action"      color="primary"  items={report.actions} numbered />
        </div>
      )}
    </div>
  );
}

function Section({ title, color, items = [], numbered }) {
  return (
    <div className="mb-3">
      <h6 className={`text-${color} border-bottom pb-1`}>{title}</h6>
      {items.map((item, i) => (
        <p key={i} className="small text-muted mb-1 ps-2">
          {numbered ? `${i + 1}.` : "•"} {item}
        </p>
      ))}
    </div>
  );
}