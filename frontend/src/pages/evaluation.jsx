import { motion } from "framer-motion";
import { Plus, ArrowUpRight, ClipboardList, FileCheck, PenLine, TrendingUp, Clock, Tag} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Siderbar from "../components/siderbar";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { useMemo } from "react";
import { toast } from "react-toastify";

const STATUS = {
  en_attente: { label: "En attente", dot: "#94a3b8", text: "#475569", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
  en_cours: { label: "En cours", dot: "#f59e0b", text: "#92400e", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  terminé: { label: "Terminé", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
};

const OrgLogo = ({ url, nom, size = 65 }) => {
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
};

const LABEL_COLORS = {
  "non conforme": { accent: "#f87171", bg: "rgba(248,113,113,0.1)" }, // red
  bronze:       { accent: "#a16207", bg: "rgba(161,98,7,0.1)" },      // bronze/brown
  argent:       { accent: "#6b7280", bg: "rgba(107,114,128,0.1)" },   // grey/silver
  or:           { accent: "#fbbf24", bg: "rgba(251,191,36,0.1)" },    // gold
  "excellence governance": { accent: "#10b981", bg: "rgba(16,185,129,0.1)" } // green
};

function progressColor(pct) {
  if (pct === 100) return "#10b981";
  if (pct >= 60) return "#3b82f6";
  if (pct >= 30) return "#f59e0b";
  return "#f87171";
}
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fc",
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
  },
 
  /* Header */
  header: {
    background: "#0f172a",
    padding: "32px 40px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6366f1",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    margin: "0 0 6px",
  },
  headerSub: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
    fontWeight: 400,
  },
  newBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.01em",
    boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 4px 14px rgba(99,102,241,0.3)",
  },
 
  body: {
    padding: "36px 40px",
    maxWidth: 1200,
  },
 
  /* Metrics */
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 36,
  },
  metricCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 22px 16px",
    border: "1px solid #e8eaf0",
    position: "relative",
    overflow: "hidden",
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-1px",
    lineHeight: 1,
    display: "block",
  },
  metricSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 5,
    display: "block",
  },
  metricBar: {
    height: 3,
    borderRadius: 99,
    marginTop: 18,
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.8s ease",
  },
 
  /* Table */
  tableSection: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e8eaf0",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
  },
  tableTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  tableCount: {
    fontSize: 12,
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 500,
  },
  tableWrap: {
    overflowX: "auto",
  },
  thead: {
    display: "grid",
    gridTemplateColumns: "1.8fr 140px 120px 180px 80px 50px",
    gap: 0,
    padding: "10px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  th: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.8fr 140px 120px 180px 80px 50px",
    gap: 0,
    padding: "14px 24px",
    borderBottom: "1px solid #f8fafc",
    alignItems: "center",
    transition: "background 0.15s",
    cursor: "pointer",
  },
 
  /* Row cells */
  orgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  orgName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
  },
  dateCell: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: "#f1f5f9",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "monospace",
    minWidth: 32,
    textAlign: "right",
  },
  preuvesBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6366f1",
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 20,
    padding: "2px 10px",
    fontFamily: "monospace",
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "#f8fafc",
    border: "1px solid #e8eaf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "all 0.15s",
  },
};

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
  const [evaluations, setEvaluations] = useState([]);
  const [latestEval, setLatestEval] = useState(null);
  const [latestLabel, setLatestLabel] = useState("_"); // displayed label
  const [loading, setLoading] = useState(true);


  const calculerScoreMoyen=useMemo(()=>{
    if(evaluations.length===0) return ;
    const scoreTotal=evaluations.reduce((somme,ev)=>somme + (ev.score || 0),0);
    const scoreMoyen=scoreTotal/evaluations.length;
    return scoreMoyen.toFixed(2);
  },[evaluations]);
        
  const totalEvals = evaluations.length;
  const terminés = evaluations.filter(ev => ev.statut === "terminé").length;
  const enCours = evaluations.filter(ev => ev.statut === "en_cours").length;
  const enAttente = evaluations.filter(ev => ev.statut === "en_attente").length;
  const totalPreuves = evaluations.reduce((sum, ev) => sum + (ev.preuves || 0), 0);
  const { backendUrl, userData } = useContext(AppContext); // userData comes from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  //const [currentOrg, setCurrentOrg] = useState(null);
  const navigate = useNavigate();

  /*const latestEval=useMemo(()=>{
    if(evaluations.length===0) return null;
    return [...evaluations].sort(
      (a, b) => new Date(b.dateSoumission) - new Date(a.dateSoumission))[0];
  },[evaluations]);
  console.log("latest eval: ",latestEval);*/
  
/*
  // récupérer les utilisateurs
    useEffect(() => {
      if (userData?.id) {
      const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${backendUrl}/users/${userData.id}`,{withCredentials: true});
        setCurrentUser(res.data);

        const resEval = await axios.get(`${backendUrl}/evaluation?userId=${userData.id}`,{withCredentials: true});
        console.log("Raw backend data:", resEval.data);
        const mappedEvals = resEval.data.map(ev => {
          let statutKey = (ev.statut || "").toLowerCase().trim();
          if (ev.statut === "en attente") statutKey = "en_attente";
          if (ev.statut === "en cours") statutKey = "en_cours";
          if (ev.statut === "terminé") statutKey = "terminé";
          console.log("Mapped statut:", statutKey, "original:", ev.statut);
          console.log("Raw backend data:", resEval.data);

          return { 
            ...ev,
            statut: statutKey,
            organismeName: ev.organismeName || "—",
            responsableName: ev.responsableName || "—",
            preuves: ev.preuves || 0,
            label: ev.label,
            dateSoumission: ev.dateSoumission,
          };
        });

        setEvaluations(mappedEvals);
        console.log("mapped evals: ",mappedEvals);
      } catch (err) {
        console.error("Erreur fetching current organisme:", err);
      }
    };

    fetchCurrentUser();
  }
}, [backendUrl, userData]);



 useEffect(() => {
  if (!userData?.id) return;

  const fetchLatestEval = async () => {
    try {
      const res = await axios.get(`${backendUrl}/evaluation/latest`, {
        params: { userId: userData.id },
        withCredentials: true
        
      });
      const latest = res.data;
      

      if (latest) {
        setLatestEval(latest);
        setLatestLabel(latest.label);
      }
    } catch (err) {
      console.error("Error fetching latest evaluation:", err);
    }
  };

  fetchLatestEval();
}, [backendUrl, userData, evaluations]);*/

useEffect(() => {
  if (!userData?.id) return;

  const fetchAll = async () => {
    try {
      //All 3 requests fire at the same time
      const [userRes, evalRes, latestRes] = await Promise.all([
        axios.get(`${backendUrl}/users/${userData.id}`, { withCredentials: true }),
        axios.get(`${backendUrl}/evaluation?userId=${userData.id}`, { withCredentials: true }),
        axios.get(`${backendUrl}/evaluation/latest`, { params: { userId: userData.id }, withCredentials: true }),
      ]);

      setCurrentUser(userRes.data);

      const mappedEvals = evalRes.data.map(ev => {
        let statutKey = (ev.statut || "").toLowerCase().trim();
        if (ev.statut === "en attente") statutKey = "en_attente";
        if (ev.statut === "en cours") statutKey = "en_cours";
        if (ev.statut === "terminé") statutKey = "terminé";
        return {
          ...ev,
          statut: statutKey,
          organismeName: ev.organismeName || "—",
          responsableName: ev.responsableName || "—",
          preuves: ev.preuves || 0,
        };
      });
      setEvaluations(mappedEvals);

      if (latestRes.data) {
        setLatestEval(latestRes.data);
        setLatestLabel(latestRes.data.label);
      }
    } catch (err) {
      console.error("Erreur fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, [backendUrl, userData?.id]); //only re-runs if userId changes

    const startEvaluation=async()=>{
      if (!currentUser) return alert("Utilisateur introuvable !");
      console.log("current user: ",currentUser);
      // Pass currentUser to EvaluationForm via location state
      navigate("/evaluationForm", { state: { currentUser } });
    }

    const latestLabelStyle = useMemo(() => {
      if (!latestLabel) return { accent: "#3b82f6", bg: "#e0f2fe" };
      const key = latestLabel.toLowerCase();
    return LABEL_COLORS[key] || { accent: "#3b82f6", bg: "#e0f2fe" };
  }, [latestLabel]);

  /*if (loading) return (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: 16,
    background: "#f8f9fc",
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: "3px solid #e2e8f0",
      borderTop: "3px solid #6366f1",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
      Chargement...
    </p>*/

    {/*Required for the spin animation to work */}
    /*<style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
  if ((currentUser && currentUser.etat !== "actif") || !currentUser) {
  return (
    <>
      <Siderbar />
      <div style={{ marginLeft: "200px", padding: "40px" }}>
        <h2 style={{ color: "#ef4444" }}>Accès refusé</h2>
        <p>Votre compte est inactif. Vous ne pouvez pas accéder aux évaluations.</p>
      </div>
    </>
  );
}*/
  return (
    <>
    
      <Siderbar/>
      <div style={{ ...styles.page, marginLeft: "200px" }}>
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div><OrgLogo url={currentUser?.organisme?.logoUrl}/></div>
            <div>
              <div style={styles.headerEyebrow}>{currentUser?.organisme?.nomOrganisme}</div>
                <h1 style={styles.headerTitle}>Évaluations</h1>
                <p style={styles.headerSub}>Suivi des évaluations et des preuves justificatives</p>
            </div>
            </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={styles.newBtn} onClick={startEvaluation}>
            <Plus size={15} strokeWidth={2.5} />
            Nouvelle évaluation
          </motion.button>
        </motion.header>

        <div style={styles.body}>
          {/* Metrics */}
          <div style={styles.metricsGrid}>
            <Metric index={0} title="Total évaluations" value={totalEvals} icon={<ClipboardList size={16} />} accent="#6366f1" />
            <Metric index={1} title="Score Global" value={calculerScoreMoyen || 0} icon={<TrendingUp size={16} />} accent="#6366f1" />
            <Metric index={2} title="En attente" value={enAttente} icon={<Clock size={16} />} accent="#3b82f6" sub="en attente de soumission" />
            <Metric index={3} title="En cours" value={enCours} icon={<PenLine size={16} />} accent="#f59e0b" sub="en cours d'evaluation" />
            <Metric index={4} title="Terminé" value={terminés} icon={<FileCheck size={16} />} accent="#10b981" sub="évaluations validées" />
            <Metric index={5} title="Preuves jointes" value={totalPreuves} icon={<ClipboardList size={16} />} accent="#3b82f6" sub="fichiers téléversés" />
            <Metric index={6} title="Label Actuel" value={latestLabel} icon={<Tag size={16} />} accent={latestLabelStyle.accent} sub={latestEval ? "" : "Aucune évaluation encore"} />

          </div>

          {/* Table */}
          <motion.section {...stagger(3)} style={styles.tableSection}>
            <div style={styles.tableTitleRow}>
              <h2 style={styles.tableTitle}>Évaluations récentes</h2>
              <span style={styles.tableCount}>{totalEvals} entrées</span>
            </div>

            <div style={styles.tableWrap}>
              {/* table header */}
              <div style={styles.thead}>
                {["Organisme", "Date de création", "Statut", "Preuves", ""].map((col, i) => (
                  <span key={i} style={{ ...styles.th, textAlign: i >= 3 ? "center" : "left" }}>{col}</span>
                ))}
              </div>

              {/* table rows */}
              {evaluations.map((ev, idx) => {
                //const cfg = STATUS[ev.status];
                const cfg = STATUS[ev.statut] || {
                  label: "Inconnu",
                  dot: "#cbd5e1",
                  text: "#475569",
                  bg: "rgba(203,213,225,0.12)",
                  border: "rgba(203,213,225,0.3)"
};
                const color = progressColor(ev.progress || 0);
                return (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.3 + idx * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }} style={styles.row}
                  onClick={() => {
                    /*if(ev?.statut==="terminé"){
                    navigate("/evalFeedback", { state: { evaluation: ev } })}
                    else{
                      toast.error("l'evaluation n'est pas encore compléte!");
                    }*/
                   navigate("/EvalEdit", { state: { evaluation: ev } });
                   }
                  }
                  >
                    {/* Organisme */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      ...styles.orgAvatar, 
                      background: `hsl(${ev.id * 47 + 200},60%,92%)`, 
                      color: `hsl(${ev.id * 47 + 200},55%,35%)` 
                    }}>
                    {ev.organismeName[0]?.toUpperCase()}
                    </div>
                    <span style={styles.orgName}>{ev.organismeName}</span>
                    </div>

                    {/* Date */}
                    <span style={styles.dateCell}>{ev.dateCreation}</span>

                    {/* Status badge */}
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
                    </div>*/}

                    {/* Preuves */}
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
                    </div>*/}
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

export default Evaluation;

