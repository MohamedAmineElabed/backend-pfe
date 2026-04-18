import { Award, FileText, Table2 } from "lucide-react";
import SiderbarEval from "../../components/siderbarEval.jsx";
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useMemo } from "react";


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
    const { backendUrl } = useContext(AppContext);
    const { id } = useParams();
    //const [organisme, setOrganisme] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("tous");
    // Fetch evaluation
  useEffect(() => {
  const fetchData = async () => {
    try {
        const res = await axios.get(`${backendUrl}/evaluation/all/treated`,{withCredentials: true});
        setEvaluations(res.data);
        console.log(res.data);
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
  const filteredEvaluations = uniqueEvaluations.filter(e => {
    const matchSearch = e.organismeName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "tous" || e.organismeType?.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

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

        uniqueEvaluations.forEach((org) => {
        if (org.label && counts.hasOwnProperty(org.label)) {
        counts[org.label]++;
        }
  });

  return counts;
}, [uniqueEvaluations]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ width: 300 }}>
        <SiderbarEval />
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

      {/* ── Table ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
          <div style={sectionTitle}>
            <Table2 style={{ width: 15, height: 15 }} />
            Détail par organisme
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{
    background: "#F9FAFB",
    borderBottom: "1px solid #E5E7EB",
    position: "sticky",
    fontFamily: "'Inter', 'SF Pro Display', 'Segoe UI', sans-serif",
    top: 0,
    zIndex: 5
  }}>
                {["Organisme", "Type", "Score global", "Label attribué"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
  {filteredEvaluations.map((org, i) => {
    const labelStyle = getLabelStyle(org.label);

    return (
      <tr
        key={i}
        style={{
          background: i % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#EEF2FF";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            i % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
        }}
      >
        <td style={tdStyle}>{org.organismeName}</td>

        <td style={tdStyle}>
          <span style={{
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            background: "#F3F4F6"
          }}>
            {org.organismeType}
          </span>
        </td>

        <td style={tdStyle}>
          <strong>
            {org.score != null
              ? `${org.score}/${org.maxScore}`
              : "—"}
          </strong>
        </td>

        <td style={tdStyle}>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              ...labelStyle
            }}
          >
            {org.label ?? "—"}
          </span>
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
        </div>

        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{uniqueEvaluations.length} organisme(s) au total</span>
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