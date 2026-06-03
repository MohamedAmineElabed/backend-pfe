import { motion } from "framer-motion";
import { Plus, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SiderbarEval from "../../components/siderbarEval.jsx";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import  Input  from "../../components/ui/input.jsx";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const STATUS = {
  en_attente: { label: "En attente", dot: "#94a3b8", text: "#475569", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
  en_cours: { label: "En cours", dot: "#f59e0b", text: "#92400e", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  //soumise: { label: "Soumise", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
  terminé: { label: "Terminé", dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
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
  thead: { display: "grid", gridTemplateColumns: "44px 1fr 1fr 0.5fr 1.5fr 1fr 100px 10px",columnGap: "30px", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" },
  row: { display: "grid", gridTemplateColumns: "44px 1fr 1fr 0.5fr 1.5fr 1fr 100px 10px",columnGap: "30px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center", cursor: "default" },
  orgName: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
  orgRole: {fontSize: 12,color: '#888',fontStyle: 'italic',marginTop: 2,display: 'block',},
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
  const location = useLocation();
  const org = location.state?.organisme;
  console.log("org: ",org);

  const [evaluations, setEvaluations] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const { backendUrl, userData } = useContext(AppContext);
  const [organismes, setOrganismes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());
  const [anneesDisponibles, setAnneesDisponibles] = useState([]);

  const updateEvaluation = (id, newData) => {
  setEvaluations(prev =>
    prev.map(ev => ev.id === id ? { ...ev, ...newData } : ev)
  );
};

/*const handleProgressClick = (ev) => {
  const newProgress = Math.min((ev.progression || 0) + 10, 100); // max 100%
  updateEvaluation(ev.id, { progression: newProgress });

  // Optional: save to backend
  axios.put(`${backendUrl}/evaluation/${ev.id}`, { progress: newProgress })
    .then(res => console.log("Saved progress for", ev.id))
    .catch(err => console.error(err));
};*/

const handleStatusChange = (ev, newStatus) => {
  updateEvaluation(ev.id, { statut: newStatus });

  axios.put(`${backendUrl}/evaluation/${ev.id}`, { status: newStatus },{withCredentials: true})
    .then(res => console.log("Saved status for", ev.id))
    .catch(err => console.error(err));
};

  // Fetch evaluations
  useEffect(() => {
  if (!backendUrl || !userData?.id) return;
  if (!org?.id) return;

  const fetchEvaluations = async (annee=anneeSelectionnee) => {
    try {
      // Fetch evaluations with treated progression
      const resEval = await axios.get(`${backendUrl}/evaluation/organisme/${org.id}`,{params: { annee: annee }, withCredentials: true});
      console.log("liste evaluations :",resEval.data);
      // Map the response directly; no need to recalc progression in frontend
      const evalsWithProgress = resEval.data.map(ev => {
        let statutKey;
        const progression = ev.progress || 0;

        if (progression === 0) {
          statutKey = "en_attente";
        } else if (progression === 100) {
          statutKey = "terminé";
        } else {
          statutKey = "en_cours";
        }

      return {
      ...ev,
      statut: statutKey,
      score: ev.score || 0,
  };
});

      setEvaluations(evalsWithProgress);
      console.log("Évaluations par organisme:", evalsWithProgress);
    } catch (err) {
      console.error("Erreur fetching evaluations:", err);
    }
  };

  fetchEvaluations();
}, [backendUrl, userData, org?.id, anneeSelectionnee]);


  //fetch annee disponible
useEffect(() => {
  const fetchAnnees = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/annee/disponibles`,
        { withCredentials: true }
      );
      const currentYear = new Date().getFullYear();
      const years = [...new Set([...res.data, currentYear])].sort((a, b) => b - a);
      setAnneesDisponibles(years);
      
      // Set default year ONLY once
      setAnneeSelectionnee(prev => prev || currentYear);
      // set default selected year (latest)
      /*if (res.data.length > 0) {
        setAnneeSelectionnee(res.data[0]);
      }*/
    } catch (error) {
      toast.error("Erreur chargement des années");
      console.error(error);
    }
  };

  fetchAnnees();
}, [backendUrl,[]]);


  // Filtered list
  /*const filtered = evaluations.filter(e => {
    const matchSearch = e.nomOrganisme.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "tous" || e.statut === filter;
    return matchSearch && matchFilter;
  });
*/
  const filters = [
  { value: "tous", label: "Tous" },
  { value: "en_attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "terminé", label: "Terminé" },
];

  //pour supprimer les evaluations
  /*const deleteEval = async (evaluationId) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${backendUrl}/evaluation/${evaluationId}`,{withCredentials: true});
      setEvaluations((prev) => {
        const updated=prev.filter((e) => e.id !== evaluationId);
        return updated;});
      toast.success("Evaluation supprimée");
    } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};*/

  const filtered = evaluations.filter((e) => {
    const matchSearch =
      (e.responsableName || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchFilter =
      filter === "tous" || e.statut === filter;

    return matchSearch && matchFilter;
  });

  return (
    <>
      <SiderbarEval />
      <div style={{ ...styles.page, marginLeft: "200px" }}>
        {/* Header */}
        <div style={{background: "#fff",border: "0.5px solid #e2e8f0",borderRadius: 12,padding: "20px 24px",display: "flex",
          alignItems: "center",justifyContent: "space-between",gap: 16,marginBottom: 20,}}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <OrgLogo url={org?.logoUrl} nom={org?.nomOrganisme} size={70} />
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 2px 0", 
            fontWeight: 600 }}>
            Évaluation
          </p>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
            {org?.nomOrganisme}
          </h1>
          <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {org?.responsable?.nom || ""} {org?.responsable?.prenom || "—"}
          </span>
          <span style={styles.orgRole}>{org?.responsable?.jobRole || "—"}</span>
          {/*<p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0 0" }}>
            Gérer et valider les évaluations soumises
          </p>*/}
        </div>
      </div>
      {/* Right —profile */}
  {/*<div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
    <div style={{ textAlign: "right" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>
        {userData?.nom || "Utilisateur"}
      </p>
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0 0" }}>
        {userData?.role || "—"}
      </p>
    </div>
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: "#eff6ff", border: "1.5px solid #bfdbfe",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, fontWeight: 700, color: "#3b82f6", flexShrink: 0,
    }}>
      {(userData?.nom?.[0] ?? "U").toUpperCase()}
    </div>
  </div>*/}
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
        {/* Year selector */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Année
              </label>
              <select
                value={anneeSelectionnee}
                onChange={e => setAnneeSelectionnee(Number(e.target.value))}
                style={{padding: "7px 32px 7px 12px",borderRadius: 10,border: "1px solid #e2e8f0",background: "#fff",color: "#0f172a",fontSize: 13,
                  fontWeight: 600,cursor: "pointer",outline: "none",appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                onBlur={e =>  { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
              >
                {anneesDisponibles.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              </div>

        {/* Table */}
        <motion.section {...stagger(3)} style={styles.tableSection}>
          <div style={styles.tableWrap}>
            <div style={styles.thead}>
              {["Index","Date création", "Dernière mise à jour", "Statut", "Progression", "Score", "Labelisation"].map((col, i) => <span key={i}>{col}</span>)}
            </div>

            {filtered.map((ev, idx) => {
              const cfg = STATUS[ev.statut] || { label: "Inconnu", dot: "#cbd5e1", text: "#475569", bg: "rgba(203,213,225,0.12)", border: "rgba(203,213,225,0.3)" };
              const color = progressColor(ev.progress || 0);
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + idx * 0.05 }} style={{ ...styles.row, cursor: "pointer" }}
                  onClick={() => navigate(`/evaluateur/evaluations/${ev.id}`, { state: { evaluation: ev } })}>
                  <span style={styles.orgName}>{idx+1}</span>
                  <span style={styles.dateCell}>{new Date(ev.dateCreation).toLocaleDateString("fr-FR")}</span>
                  <span style={styles.dateCell}>{new Date(ev.dateUpdate).toLocaleDateString("fr-FR")}</span>
                  <span style={{ ...styles.badge, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <span style={{ ...styles.badgeDot, background: cfg.dot }} /> {cfg.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={styles.progressTrack} onClick={(e) => { e.stopPropagation(); handleProgressClick(ev); }}>
                      <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${ev.progress || 0}%` }} 
                      transition={{ duration: 0.7 }} 
                      style={{ ...styles.progressFill, background: color }} 
                      />
                    </div>
                    <span style={{ ...styles.progressPct, color }}>{ev.progress || 0}%</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color }}>{ev.score || 0}/{ev.scoreMax || 0}</span>
                  <span style={styles.orgName}>{ev.label || "Non labellisé"}</span>
                  
                  {/*<button
                    className="btn btn-outline-danger btn-sm"
                    onClick={(e) => {e.stopPropagation();deleteEval(ev.id);}}>
                    <i className="bi bi-trash"></i>
                  </button>*/}
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