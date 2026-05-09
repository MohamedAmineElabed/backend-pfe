import { Award, FileText, Table2, Trophy } from "lucide-react";
import SiderbarEval from "../../components/siderbarEval.jsx";
import SiderbarAdmin from "../../components/siderbarAdmin.jsx";
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useMemo } from "react";

const styles = {
  page: { minHeight: "100vh", background: "#f8f9fc", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", padding: "36px 40px", maxWidth: 1200 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: 800, color: "#1e293b" },
  headerSub: { fontSize: 13, color: "#64748b" },
  newBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tableSection: { background: "#fff", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  thead: { display: "grid", gridTemplateColumns: "60px 120px 120px 140px 140px 100px",columnGap: "30px", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" },
  row: { display: "grid", gridTemplateColumns: "60px 120px 120px 140px 140px 100px",columnGap: "30px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center", cursor: "default" },
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


const labels = [
  {
    key: "excellent",
    label: "Excellence governance",
    description: "Très haute gouvernance",
    count: 0,
    colors: {
      bg: "#E1F5EE", border: "#9FE1CB",
      iconStroke: "#0F6E56", name: "#085041",
      sub: "#0F6E56", count: "#085041",
    },
  },
  {
    key: "or",
    label: "Or",
    description: "Bonne gouvernance",
    count: 0,
    colors: {
      bg: "#FEF7C3", 
      border: "#FACC15", 
      iconStroke: "#B45309",
      name: "#B45309",     
      sub: "#B45309",
      count: "#B45309",
    },
  },
  {
    key: "argent",
    label: "Argent",
    description: "Gouvernance acceptable",
    count: 0,
    colors: {
      bg: "#E5E7EB",     
      border: "#9CA3AF",  
      iconStroke: "#6B7280",
      name: "#374151",    
      sub: "#6B7280",
      count: "#374151",
    },
  },
  {
    key: "bronze",
    label: "Bronze",
    description: "À améliorer",
    count: 0,
    colors: {
      bg: "#FAEEDA", border: "#FAC775",
      iconStroke: "#854F0B", name: "#633806",
      sub: "#854F0B", count: "#633806",
    },
  },
  {
    key: "faible",
    label: "Non conforme",
    description: "Gouvernance insuffisante",
    count: 0,
    colors: {
      bg: "#FCEBEB", border: "#F7C1C1",
      iconStroke: "#A32D2D", name: "#791F1F",
      sub: "#A32D2D", count: "#791F1F",
    },
  },
];
  
const AwardIcon = ({ stroke }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const Labellisation = () => {
    const { backendUrl, userData } = useContext(AppContext);
    const { id } = useParams();
    //const [organisme, setOrganisme] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("tous");
    const [sortBy, setSortBy] = useState("score");
    const [isEmpty, setIsEmpty] = useState(false);

    const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());
    const [anneesDisponibles, setAnneesDisponibles] = useState([]);

    const SidebarComponent =
        userData?.role === "ADMIN"
            ? SiderbarAdmin
            : userData?.role === "EVALUATEUR"
            ? SiderbarEval
            : Siderbar;
            
    // Fetch evaluation
  useEffect(() => {
  const fetchData = async (annee=anneeSelectionnee) => {
    try {
        const res = await axios.get(`${backendUrl}/evaluation/all/latest/treated`,{params: { annee }, withCredentials: true});
        console.log(res.data);
        setEvaluations(res.data);
        //console.log(res.data);
        /*const organismeDetails =await Promise.all(evaluations.map(async (org) => {
          const orgRes = await axios.get(`${backendUrl}/organismes/${org.id}`);
          return { ...org, typeOrg: orgRes.data.type }; // add type to object
        }));*/
        
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    }
  };

  fetchData();
}, [backendUrl, anneeSelectionnee]);

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

  const rankedEvaluations = useMemo(() => {
  return [...evaluations]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((org, index) => ({ ...org, rank: index + 1 })); // rank assigned globally
}, [evaluations]);

  // Filtered list
  const filteredEvaluations = rankedEvaluations.filter(e => {
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
  const getLabelBadge = (label) => {
    const styles = {
    "Excellence governance": { color: "#065f46", background: "#d1fae5" },
    "Or":                    { color: "#78350f", background: "#fde68a" },
    "Argent":                { color: "#374151", background: "#e5e7eb" },
    "Bronze":                { color: "#78350f", background: "#fef3c7" },
    "Non conforme":          { color: "#b91c1c", background: "#fee2e2" },
  };
  const s = styles[label] || { color: "#374151", background: "#f3f4f6" };
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px",
      borderRadius: 12, fontSize: 13, fontWeight: 600,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      ...s,
    }}>
      {label || "Non évalué"}
    </span>
  );
  };

  const filters = [
  { value: "tous", label: "Tous" },
  { value: "publique", label: "Publique" },
  { value: "prive", label: "Privé" },
  { value: "societe civile", label: "Société civile" },
];

    const labelCounts = useMemo(() => {
        const counts = {};
        labels.forEach(l => {
            counts[l.label] = 0;
        });

        evaluations.forEach((org) => {
          if (org.label && counts.hasOwnProperty(org.label)) {
          counts[org.label]++;
          }
        });

  return counts;
}, [evaluations]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ width: 300 }}>
        <SidebarComponent />
      </div>
    
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", padding: "1.5rem 0", fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Award style={{ width: 32, height: 32, color: "var(--color-text-info, #185FA5)" }} />
          <h1 style={{
  fontSize: 26,
  fontWeight: 600,
  background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
}}>
  Labellisation
</h1>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5, paddingLeft: 42 }}>
          Attribution automatique des labels selon le score global de gouvernance des organismes évalués.
        </p>
      </div>

      {/* Year selector */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8,  }}>
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

      {/* ── Label grid ── */}
      <div style={card}>
        <div style={sectionTitle}>
          <FileText style={{ width: 15, height: 15 }} />
          Barème de labellisation
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
          {labels.map(({ key, label, min, description, count, colors }) => (
            <div key={key} style={{
              background: colors.bg,
              border: `0.5px solid ${colors.border}`,
              borderRadius: "var(--border-radius-md, 8px)",
              padding: "1rem 0.75rem",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <AwardIcon stroke={colors.iconStroke} />
              <span style={{ fontSize: 14, fontWeight: 500, color: colors.name }}>{label}</span>
              <span style={{ fontSize: 11, color: colors.sub, textAlign: "center", lineHeight: 1.4 }}>{description}</span>
              <div style={{ width: "100%", height: "0.5px", background: colors.sub, opacity: 0.2, margin: "6px 0" }} />
              <span style={{ fontSize: 22, fontWeight: 500, color: colors.count }}>{labelCounts[label] || 0}</span>
              <span style={{ fontSize: 11, color: colors.sub }}>organisme(s)</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Podium ── */}
{rankedEvaluations.length >= 1 && (
  <div style={card}>
    <div style={sectionTitle}>
      <Trophy style={{ width: 13, height: 13 }} />
      Podium
    </div>

    <div style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 10,
      padding: "0 8px",
    }}>
      {[1, 0, 2].map((rank) => {
        const org = rankedEvaluations[rank];
        if (!org) return <div key={rank} style={{ flex: 1 }} />;

        const pct = org.score && org.scoreMax
          ? Math.round((org.score / org.scoreMax) * 100)
          : 0;

        const configs = {
          0: {
            medal: "🥇", blockHeight: 120, num: "1",
            blockBg: "#FEF3C7", blockNumColor: "#B45309",
            scoreColor: "#B8860B", cardBorderColor: "#D4A017",
          },
          1: {
            medal: "🥈", blockHeight: 88, num: "2",
            blockBg: "#F1F5F9", blockNumColor: "#94A3B8",
            scoreColor: "#64748B", cardBorderColor: "#E2E8F0",
          },
          2: {
            medal: "🥉", blockHeight: 60, num: "3",
            blockBg: "#F1F5F9", blockNumColor: "#94A3B8",
            scoreColor: "#8B5E3C", cardBorderColor: "#E2E8F0",
            blockOpacity: 0.8,
          },
        };
        const cfg = configs[rank];

        return (
          <div key={rank} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            maxWidth: 140,
          }}>
            {/* Medal */}
            <span style={{ fontSize: 18, marginBottom: 5, lineHeight: 1 }}>
              {cfg.medal}
            </span>

            {/* Card */}
            <div style={{
              background: "#fff",
              border: `1px solid ${cfg.cardBorderColor}`,
              borderRadius: 12,
              padding: "12px 10px 10px",
              textAlign: "center",
              width: "100%",
              boxSizing: "border-box",
              marginBottom: 8,
            }}>
              <img
                src={org.logoUrl}
                alt={org.organismeName}
                style={{
                  width: 36, height: 36,
                  objectFit: "contain",
                  borderRadius: 8,
                  border: "0.5px solid #E2E8F0",
                  background: "#F8FAFC",
                  padding: 3,
                  marginBottom: 8,
                  display: "block",
                  margin: "0 auto 8px",
                }}
              />
              <div style={{
                fontSize: 11, fontWeight: 500, color: "#1e293b",
                marginBottom: 2, lineHeight: 1.3,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {org.organismeName}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6 }}>
                {org.organismeType || "—"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: cfg.scoreColor }}>
                {pct}%
              </div>
            </div>

            {/* Podium block */}
            <div style={{
              width: "100%",
              height: cfg.blockHeight,
              background: cfg.blockBg,
              borderRadius: "6px 6px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: cfg.blockOpacity ?? 1,
            }}>
              <span style={{ fontSize: 20, fontWeight: 500, color: cfg.blockNumColor }}>
                {cfg.num}
              </span>
            </div>
          </div>
        );
      })}
    </div>

    {/* Floor */}
    <div style={{
      height: 6,
      background: "#F1F5F9",
      borderRadius: "0 0 8px 8px",
    }} />
  </div>
)}


      {/* ── Table ── */}
      <div style={card}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
    <div style={sectionTitle}>
      <Trophy style={{ width: 15, height: 15 }} />
      Classement des organismes
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Rechercher un organisme…"
        style={inputStyle}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select style={inputStyle} value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="tous">Tous les types</option>
        <option value="publique">Publique</option>
        <option value="prive">Privé</option>
        <option value="societe civile">Société civile</option>
      </select>
    </div>
  </div>

  <div style={{ overflowX: "auto" }}>
    {/* Header row */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 120px 160px 80px 120px 50px",
      columnGap: 16,
      padding: "10px 16px",
      background: "#F9FAFB",
      borderBottom: "1px solid #E5E7EB",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
    }}>
      <span>Rang</span>
      <span>Organisme</span>
      <span>Type</span>
      <span>Date soumission</span>
      <span>Score</span>
      <span>Label</span>
    </div>

    {/* Data rows */}
    {filteredEvaluations.map((org, i) => {
      const pct = org.score && org.scoreMax
        ? Math.round((org.score / org.scoreMax) * 100)
        : 0;

      return (
        <div
          key={org.id ?? i}
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 120px 160px 80px 130px 50px",
            columnGap: 16,
            padding: "14px 16px",
            borderBottom: "1px solid #F1F5F9",
            alignItems: "center",
            background: i % 2 === 0 ? "#fff" : "#F9FAFB",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#EEF2FF"}
          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#F9FAFB"}
        >
          <span>{getMedalIcon(org.rank)}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{org.organismeName}</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{org.organismeType || "—"}</span>
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{org.dateUpdate || "—"}</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{pct}%</span>
          {getLabelBadge(org.label)}
        </div>
      );
    })}

    {filteredEvaluations.length === 0 && (
      <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
        Aucun organisme trouvé.
      </div>
    )}
  </div>

  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ fontSize: 13, color: "#6B7280" }}>{filteredEvaluations.length} organisme(s) affiché(s)</span>
  </div>
</div>

    </div>
    </div>
  );
};
const getLabelStyle = (label) => {
  switch (label) {
    case "Excellence governance":
      return { background: "#D1FAE5", color: "#065F46" };
    case "Or":
      return { background: "#DBEAFE", color: "#1E40AF" };
    case "Argent":
      return { background: "#ECFCCB", color: "#365314" };
    case "Bronze":
      return { background: "#FEF3C7", color: "#92400E" };
    case "Non conforme":
      return { background: "#FEE2E2", color: "#991B1B" };
    default:
      return { background: "#F3F4F6", color: "#374151" };
  }
};

const card = {
  background: "#fff", // brighter, cleaner background
  border: "1px solid #E5E7EB", // softer border
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)", // subtle shadow for elevation
  transition: "transform 0.2s, box-shadow 0.2s",
};

const cardHover = {
  transform: "translateY(-2px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const sectionTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#6B7280", // gray-500 for subtlety
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const inputStyle = {
  fontSize: 13,
  padding: "8px 14px", // slightly larger padding
  border: "1px solid #D1D5DB",
  borderRadius: "8px",
  background: "#F9FAFB",
  color: "#111827",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
};

const inputFocusStyle = {
  border: "1px solid #3B82F6",
  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
};

const labelPill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  border: "1px solid #D1D5DB",
  color: "#4B5563",
  background: "#F3F4F6",
  transition: "background 0.2s",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
  color: "#374151",
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  background: "#F9FAFB",
};

const tdStyle = {
  padding: "12px 12px",
  color: "#111827",
  borderBottom: "1px solid #E5E7EB",
};

const rowHover = {
  transition: "background 0.2s",
  cursor: "pointer",
};

const rowHoverEffect = {
  background: "#F3F4F6",
};

const badgePublic = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background: "#DBEAFE", // light blue
  color: "#1E40AF",
};

const badgePrive = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background: "#EDE9FE", // light purple
  color: "#4C1D95",
};


export default Labellisation;