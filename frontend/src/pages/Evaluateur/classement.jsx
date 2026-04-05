import { useEffect, useState, useContext,useMemo } from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowUpDown, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import SiderbarEval from "../../components/siderbarEval";
import { AppContext } from "../../context/AppContext.jsx";

const styles = {
  page: { minHeight: "100vh", background: "#f8f9fc", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", padding: "36px 40px", maxWidth: 1200 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: 800, color: "#1e293b" },
  headerSub: { fontSize: 13, color: "#64748b" },
  newBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tableSection: { background: "#fff", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  thead: { display: "grid", gridTemplateColumns: "60px 120px 120px 140px 140px 100px",columnGap: "30px", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" },
  row: { display: "grid", gridTemplateColumns: "60px 120px 120px 140px 120px 100px",columnGap: "30px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center", cursor: "default" },
  orgName: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
  dateCell: { fontSize: 12, color: "#94a3b8", fontFamily: "monospace" },
  badge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em" },
  badgeDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  progressTrack: { flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },
  progressPct: { fontSize: 11, fontWeight: 700, fontFamily: "monospace", minWidth: 32, textAlign: "right" },
  arrowBtn: { width: 28, height: 28, borderRadius: 8, background: "#f8fafc", border: "1px solid #e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: "pointer" },
  tableStyle : {width: "100%",borderCollapse: "collapse",fontSize: 14,color: "#374151"},
  thStyle : {textAlign: "left",padding: "12px 16px",background: "#f3f4f6",color: "#6b7280",textTransform: "uppercase",fontSize: 12,letterSpacing: "0.02em"},
  tdStyle : {padding: "12px 16px",borderBottom: "1px solid #e5e7eb"},
  inputStyle :{
  fontSize: 13,
  padding: "8px 14px", // slightly larger padding
  border: "1px solid #D1D5DB",
  borderRadius: "8px",
  background: "#F9FAFB",
  color: "#111827",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
},

  filterBar: {
  display: "flex",
  alignItems: "center",
  gap: 12,           // spacing between filters
  flexWrap: "wrap",
  padding: "16px 24px",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb",
  borderRadius: "16px 16px 0 0", // rounded top corners matching table
},
};

const Classement = () => {
  const [evaluations, setEvaluations] = useState([]); // data from API
  const [sortBy, setSortBy] = useState("score");
  const [filter, setFilter] = useState("tous");
  const [search, setSearch] = useState("");
  const { backendUrl } = useContext(AppContext);
  const [isEmpty, setIsEmpty] = useState(false);
  

  // récupérer les utilisateurs
  
  /*const fetchOrganismes = async () => {
    try {
      const response = await axios.get(`${backendUrl}/organismes`);
      const filteredOrganismes = response.data.filter(org => org.responsable?.role !== "ADMIN" && org.responsable?.role !== "EVALUATEUR");    //org.responsable?.role iptional chaing pour verifier si le responsable existe ou non
      setOrganismes(filteredOrganismes);
      console.log("Organismes récupérés:", filteredOrganismes);
      //setOrganismes(response.data);
      setIsEmpty(filteredOrganismes.length === 0);
    } catch (err) {
      toast.error("Erreur lors de la récupération des organismes");
    }
  };

  useEffect(() => {
    fetchOrganismes();
  }, []);*/

  // Fetch evaluation
  useEffect(() => {
  const fetchData = async () => {
    try {
        const res = await axios.get(`${backendUrl}/evaluation/all/treated`);
        setEvaluations(res.data);
        console.log(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    }
  };
  fetchData();
}, [backendUrl]);

    

  


  const uniqueEvaluations = useMemo(() => {
  const map = new Map();

  evaluations.forEach((evalItem) => {
    const key = evalItem.organismeName;

    if (!map.has(key)) {
      map.set(key, evalItem);
    } else {
      const existing = map.get(key);

      // compare scores → keep highest
      if ((evalItem.score || 0) > (existing.score || 0)) {
        map.set(key, evalItem);
      }
    }
  });
  return Array.from(map.values());
}, [evaluations]);



  // Filtered list
  const filtered = uniqueEvaluations.filter(e => {
    const matchSearch = e.organismeName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "tous" || e.organismeType?.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

    

  
  // Medal icon for top ranks
  const getMedalIcon = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  // Badge for score label
  const getLabelBadge = (pct) => {
    let label = "Non évalué";
    let colorClass = "bg-gray-100 text-gray-600 border-gray-300";

    if (pct < 40) {
    label = "Non conforme";
    colorClass = "bg-primary/15 text-primary border-primary/30";  // light red style
  } else if (pct >= 40 && pct <= 59) {
    label = "Bronze";
    colorClass = "bg-yellow-100 text-yellow-800 border-yellow-300"; // bronze-ish
  } else if (pct >= 60 && pct <= 79) {
    label = "Argent";
    colorClass = "bg-gray-200 text-gray-800 border-gray-300"; // silver-ish
  } else if (pct >= 80 && pct <= 89) {
    label = "Or";
    colorClass = "bg-yellow-200 text-yellow-800 border-yellow-300"; // gold-ish
  } else { // pct >= 90
    label = "Excellence governance";
    colorClass = "bg-green-100 text-green-800 border-green-300"; // top label
  }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}
      style={{
  display: "inline-block",
  padding: "4px 10px",         // smaller padding
  borderRadius: 12,
  fontSize: 15,                 // slightly smaller
  fontWeight: 600,
  color: pct < 40? "#b91c1c"      
    : pct <= 59
    ? "#78350f"       
    : pct <= 79
    ? "#374151"       
    : pct <= 89
    ? "#78350f"      
    : "#065f46",     
  background: pct < 40
    ? "#fee2e2"   
    : pct <= 59
    ? "#fef3c7"     
    : pct <= 79
    ? "#e5e7eb"     
    : pct <= 89
    ? "#fde68a"     
    : "#d1fae5",    
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  letterSpacing: "0.5px",
  transition: "all 0.2s ease",
}}
      >
        {label}
      </span>
    );
  };

  return (
  <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
    
    {/* Sidebar */}
    <div style={{ width: 260, flexShrink: 0 }}>
      <SiderbarEval />
    </div>

    {/* Main content */}
    <div style={{ ...styles.page, marginLeft: 0, flex: 1 }}>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Classement</h1>
          <p style={styles.headerSub}>
            Voir le classement des organismes évalués
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableSection}>
        {/* Filters */}
<div style={styles.filterBar}>
  <input
    type="text"
    placeholder="Rechercher un organisme…"
    style={{ ...styles.inputStyle, flex: 1, minWidth: 200 }}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <select
    style={{ ...styles.inputStyle, minWidth: 160 }}
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
  >
    <option value="tous">Tous les types</option>
    <option value="publique">Publique</option>
    <option value="prive">Privé</option>
    <option value="societe civile">Société civile</option>
  </select>
</div>
        <div style={styles.tableWrap}>
          
          {/* Header */}
          <div
            style={styles.thead}
          >
            <span>Rang</span>
            <span>Organisme</span>
            <span>Type</span>
            <span>Date soumission</span>
            <span>Score</span>
            <span>Label</span>
          </div>

          {/* Rows */}
          {filtered.map((org, index) => {
            const rank = index + 1;
            const pct =org.score && org.maxScore ?Math.round(org.score / org.maxScore * 100) : 0;

            return (
              <div
                key={org.id}
                style={styles.row}
              >
                {/* Rank */}
                <span>{getMedalIcon(rank)}</span>
                {/* Name */}
                <span style={styles.orgName}>{org.organismeName}</span>
                {/* Type */}
                <span>{org.organismeType || "-"}</span>
                {/* Date */}
                <span>{org.dateCreation || "-"}</span>
                {/* Score */}
                <span style={{ fontWeight: 700 }}>{pct ?? 0}%</span>
                

                {/* Badge */}
            {getLabelBadge(pct|| 0)}
              </div>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: "center" }}>
              Aucun organisme trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Classement;