import { motion } from "framer-motion";
import { Plus, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SiderbarEval from "../../components/siderbarEval.jsx";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import  Input  from "../../components/ui/input.jsx";

const STATUS = {
  brouillon: { label: "Brouillon", dot: "#94a3b8", text: "#475569", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
  en_cours: { label: "En cours", dot: "#f59e0b", text: "#92400e", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  soumise: { label: "soumise", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
  rejetee: { label: "Rejetée", dot: "#f87171", text: "#7f1d1d", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
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
  thead: { display: "grid", gridTemplateColumns: "2fr 140px 120px 180px 80px 50px", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" },
  row: { display: "grid", gridTemplateColumns: "2fr 140px 120px 180px 80px 50px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center", cursor: "default" },
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

  // Fetch evaluations
  useEffect(() => {
  if (!backendUrl || !userData?.id) return;

  const fetchEvaluations = async () => {
    try {
      console.log("Fetching evaluations for user:", userData.id);

      const resEval = await axios.get(
        `${backendUrl}/evaluation/all`
      );

      console.log("Raw backend data:", resEval.data);

      const mappedEvals = resEval.data.map(ev => {
        let statutKey = (ev.status || "").toLowerCase().trim();

        if (statutKey === "submitted") statutKey = "soumise";
        else if (statutKey === "in_progress") statutKey = "en_cours";
        else if (statutKey === "draft") statutKey = "brouillon";
        else if (statutKey === "rejected") statutKey = "rejetee";

        return {
          ...ev,
          statut: statutKey,
          progression: ev.progress || 0
        };
      });

      setEvaluations(mappedEvals);

      console.log("Mapped Evaluations:", mappedEvals);

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
    { value: "en_cours", label: "En cours" },
    { value: "soumise", label: "soumise" },
    { value: "rejetee", label: "Rejetées" },
    { value: "brouillon", label: "Brouillon" },
  ];

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
              {["Organisme", "Responsable", "Statut", "Progression"].map((col, i) => <span key={i}>{col}</span>)}
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
                    <div style={styles.progressTrack}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${ev.progression || 0}%` }} transition={{ duration: 0.7 }} style={{ ...styles.progressFill, background: color }} />
                    </div>
                    <span style={{ ...styles.progressPct, color }}>{ev.progression || 0}%</span>
                  </div>
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

export default EvaluationsListe;