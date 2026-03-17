/*import { motion } from "framer-motion";
import { Plus, ArrowUpRight, ClipboardList, FileCheck, PenLine, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Siderbar from "../components/siderbar";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";

const STATUS = {
  brouillon: { label: "Brouillon", dot: "#94a3b8", text: "#475569", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
  en_cours: { label: "En cours", dot: "#f59e0b", text: "#92400e", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  soumise: { label: "Soumise", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
};

function progressColor(pct) {
  if (pct === 100) return "#10b981";
  if (pct >= 60) return "#3b82f6";
  if (pct >= 30) return "#f59e0b";
  return "#f87171";
}

const stagger = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] } });

function Metric({ title, value, sub, icon, accent, index }) {
  return (
    <motion.div {...stagger(index)} style={styles.metricCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={styles.metricTitle}>{title}</span>
        <div style={{ ...styles.metricIcon, background: accent + "18", color: accent }}>{icon}</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <span style={{ ...styles.metricValue, color: accent }}>{value}</span>
        {sub && <span style={styles.metricSub}>{sub}</span>}
      </div>
      <div style={{ ...styles.metricBar, background: accent + "30" }}>
        <div style={{ ...styles.metricBarFill, background: accent, width: `${Math.min(100, value * 12)}%` }} />
      </div>
    </motion.div>
  );
}

const Evaluation = () => {
  const { backendUrl, currentUser } = useContext(AppContext);
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluationId, setCurrentEvaluationId] = useState(null);
  const navigate = useNavigate();

  const organismeId = currentUser?.organismeId;

  const startEvaluation = async () => {
    if (!organismeId) return alert("Organisme introuvable pour l'utilisateur !");
    try {
      const res = await axios.post(`${backendUrl}/evaluation`, { organismeId });
      setCurrentEvaluationId(res.data); // save new evaluation ID
      navigate("/evaluationForm"); // redirect to evaluation form page
    } catch (err) {
      console.error("Erreur lors de la création de l'évaluation", err);
    }
  };

  // fetch evaluations for this organisme
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!organismeId) return;
      try {
        const res = await axios.get(`${backendUrl}/evaluation/organisme/${organismeId}`);
        setEvaluations(res.data);
      } catch (err) {
        console.error("Erreur chargement évaluations", err);
      }
    };
    fetchEvaluations();
  }, [backendUrl, organismeId]);

  // metrics
  const totalEvals = evaluations.length;
  const soumises = evaluations.filter((e) => e.status === "soumise").length;
  const enCours = evaluations.filter((e) => e.status === "en_cours").length;
  const totalPreuves = evaluations.reduce((s, e) => s + (e.preuves || 0), 0);

  return (
    <>
      <Siderbar />
      <div style={styles.page}>
        {/* Header 
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} style={styles.header}>
          <div>
            <div style={styles.headerEyebrow}>Sprint 3 · RSE 2025</div>
            <h1 style={styles.headerTitle}>Évaluations</h1>
            <p style={styles.headerSub}>Suivi des évaluations et des preuves justificatives</p>
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={styles.newBtn} onClick={startEvaluation}>
            <Plus size={15} strokeWidth={2.5} />
            Nouvelle évaluation
          </motion.button>
        </motion.header>

        <div style={styles.body}>
          {/* Metrics 
          <div style={styles.metricsGrid}>
            <Metric index={0} title="Total évaluations" value={totalEvals} icon={<ClipboardList size={16} />} accent="#6366f1" />
            <Metric index={1} title="Soumises" value={soumises} icon={<FileCheck size={16} />} accent="#10b981" sub="évaluations validées" />
            <Metric index={2} title="En cours" value={enCours} icon={<PenLine size={16} />} accent="#f59e0b" sub="en attente de soumission" />
            <Metric index={3} title="Preuves jointes" value={totalPreuves} icon={<TrendingUp size={16} />} accent="#3b82f6" sub="fichiers téléversés" />
          </div>

          {/* Table 
          <motion.section {...stagger(4)} style={styles.tableSection}>
            <div style={styles.tableTitleRow}>
              <h2 style={styles.tableTitle}>Évaluations récentes</h2>
              <span style={styles.tableCount}>{totalEvals} entrées</span>
            </div>

            <div style={styles.tableWrap}>
              {/* table header 
              <div style={styles.thead}>
                {["Organisme", "Date de création", "Statut", "Progression", "Preuves", ""].map((col, i) => (
                  <span key={i} style={{ ...styles.th, textAlign: i >= 4 ? "center" : "left" }}>{col}</span>
                ))}
              </div>

              {/* table rows 
              {evaluations.map((ev, idx) => {
                const cfg = STATUS[ev.status];
                const color = progressColor(ev.progress || 0);
                return (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }} style={styles.row}>
                    {/* Organisme 
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ ...styles.orgAvatar, background: `hsl(${ev.id * 47 + 200},60%,92%)`, color: `hsl(${ev.id * 47 + 200},55%,35%)` }}>
                        {ev.organisme[0]}
                      </div>
                      <span style={styles.orgName}>{ev.organisme}</span>
                    </div>

                    {/* Date 
                    <span style={styles.dateCell}>{ev.dateCreation}</span>

                    {/* Status badge 
                    <div>
                      <span style={{ ...styles.badge, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <span style={{ ...styles.badgeDot, background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Progress 
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={styles.progressTrack}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${ev.progress || 0}%` }} transition={{ delay: 0.5 + idx * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ ...styles.progressFill, background: color }} />
                      </div>
                      <span style={{ ...styles.progressPct, color }}>{ev.progress || 0}%</span>
                    </div>

                    {/* Preuves 
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={styles.preuvesBadge}>{ev.preuves || 0}</span>
                    </div>

                    {/* Arrow 
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Link to={`/evaluationForm`}>
                        <motion.div whileHover={{ x: 2, y: -2 }} style={styles.arrowBtn}>
                          <ArrowUpRight size={14} strokeWidth={2} />
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default Evaluation;*/
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";

const Evaluation = () => {
  const { backendUrl, userData } = useContext(AppContext); // userData comes from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  //const [currentOrg, setCurrentOrg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If userData exists, fetch fresh user info from backend
    if (userData?.id) {
      const fetchCurrentUser = async () => {
        try {
          const res = await axios.get(`${backendUrl}/users/${userData.id}`);
          setCurrentUser(res.data);
          /*const resOrg = await axios.get(`${backendUrl}/organismes/${userData.id}`);
          setCurrentOrg(resOrg.data);*/
        } catch (err) {
          console.error("Erreur fetching current organisme:", err);
        }
      };
      fetchCurrentUser();
    }
  }, [backendUrl, userData]);

  /*const startEvaluation = async () => {
    const organismeId = currentUser?.organisme?.id;
    const responsableId=currentUser?.id;
    if (!organismeId) return alert("Organisme introuvable pour l'utilisateur !");
    try {
      const res = await axios.post(`${backendUrl}/evaluation/new`, { organismeId,responsableId });
      console.log("Nouvelle évaluation créée :", res.data);
      navigate("/evaluationForm", { state: { currentUser, evaluationId: res.data} });
    } catch (err) {
      console.error("Erreur lors de la création de l'évaluation", err);
    }
  };*/
    const startEvaluation=async()=>{
      if (!currentUser) return alert("Utilisateur introuvable !");
      console.log("current user: ",currentUser);
      // Pass currentUser to EvaluationForm via location state
      navigate("/evaluationForm", { state: { currentUser } });
    }

  return (
    <button
      onClick={startEvaluation}
      //onClick={navigate("/evaluationForm", { state: { currentUser, evaluationId: res.data} })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Nouvelle évaluation
    </button>
  );
};

export default Evaluation;