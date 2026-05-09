// pages/Dashboards.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/siderbarAdmin.jsx";
import StatCard from "../../components/evaluateur/statCard.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";

import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ResponsiveContainer
} from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f43f5e","#a3e635"];
const LABEL_COLORS = {
  "Non conforme": "#ef4444",
  "Bronze":       "#b45309",
  "Argent":       "#6b7280",
  "Or":           "#d97706",
  "Excellence governance": "#7c3aed",
  "Non évalué":   "#9ca3af",
};
const STATUS_COLORS = {
  "terminé":    "#10b981",
  "en cours":   "#f59e0b",
  "en attente": "#6b7280",
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  filterOrgType, setFilterOrgType,
  filterOrgSecteur, setFilterOrgSecteur,
  organismesSecteurs, organismeTypes, onReset
}) {
  const isActive = filterDateFrom || filterDateTo || filterOrgType !== "all" || filterOrgSecteur !== "all";
  return (
    <div style={{
      display:"flex", flexWrap:"wrap", alignItems:"center", gap:"12px",
      padding:"16px 20px", background:"#fff", borderRadius:"12px",
      boxShadow:"0 1px 3px rgba(0,0,0,0.1)", marginBottom:"24px"
    }}>
      <span style={{ fontWeight:600, color:"#374151", fontSize:"14px" }}>Filtres</span>

      {[
        { label:"Date début", type:"date", value:filterDateFrom, set:setFilterDateFrom },
        { label:"Date fin",   type:"date", value:filterDateTo,   set:setFilterDateTo },
      ].map(({ label, type, value, set }) => (
        <div key={label} style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
          <label style={{ fontSize:"11px", color:"#6b7280", fontWeight:500 }}>{label}</label>
          <input type={type} value={value} onChange={e => set(e.target.value)}
            style={{ padding:"6px 10px", border:"1px solid #d1d5db", borderRadius:"8px", fontSize:"13px", color:"#374151", outline:"none", cursor:"pointer" }} />
        </div>
      ))}

      {[
        { label:"Type d'organisme", value:filterOrgType, set:setFilterOrgType, defaultLabel:"Tous les types", items:organismeTypes },
        { label:"Secteur d'activité", value:filterOrgSecteur, set:setFilterOrgSecteur, defaultLabel:"Tous les secteurs", items:organismesSecteurs },
      ].map(({ label, value, set, defaultLabel, items }) => (
        <div key={label} style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
          <label style={{ fontSize:"11px", color:"#6b7280", fontWeight:500 }}>{label}</label>
          <select value={value} onChange={e => set(e.target.value)}
            style={{ padding:"6px 10px", border:"1px solid #d1d5db", borderRadius:"8px", fontSize:"13px", color:"#374151", background:"#fff", cursor:"pointer", outline:"none", minWidth:"160px" }}>
            <option value="all">{defaultLabel}</option>
            {items.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      ))}

      <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
        <label style={{ fontSize:"11px", color:"transparent" }}>.</label>
        <button onClick={onReset}
          style={{ padding:"6px 14px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"13px", background:"#f9fafb", color:"#6b7280", cursor:"pointer", fontWeight:500 }}
          onMouseEnter={e => { e.target.style.background="#f3f4f6"; e.target.style.color="#374151"; }}
          onMouseLeave={e => { e.target.style.background="#f9fafb"; e.target.style.color="#6b7280"; }}>
          ✕ Réinitialiser
        </button>
      </div>

      {isActive && (
        <div style={{ marginLeft:"auto", padding:"4px 10px", background:"#eff6ff", color:"#3b82f6", borderRadius:"20px", fontSize:"12px", fontWeight:600, border:"1px solid #bfdbfe" }}>
          Filtre actif
        </div>
      )}
    </div>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div style={{ background:"#fff", padding:"20px", borderRadius:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.1)", ...style }}>
      <h3 style={{ marginBottom: subtitle ? "4px" : "20px", color:"#374151", fontSize:"15px", fontWeight:600 }}>{title}</h3>
      {subtitle && <p style={{ marginBottom:"16px", color:"#9ca3af", fontSize:"12px" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label = "Aucune donnée disponible" }) {
  return (
    <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", fontSize:"14px" }}>
      {label}
    </div>
  );
}

// ─── Certification Funnel (custom) ────────────────────────────────────────────
function CertificationFunnel({ data }) {
  const max = data[0]?.value || 1;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"8px", padding:"8px 0" }}>
      {data.map((step, i) => {
        const pct = (step.value / max) * 100;
        return (
          <div key={step.name}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span style={{ fontSize:"13px", color:"#374151", fontWeight:500 }}>{step.name}</span>
              <span style={{ fontSize:"13px", color:"#6b7280", fontWeight:600 }}>{step.value}</span>
            </div>
            <div style={{ background:"#f3f4f6", borderRadius:"8px", height:"32px", overflow:"hidden" }}>
              <div style={{
                width:`${pct}%`, height:"100%", background:step.fill,
                borderRadius:"8px", display:"flex", alignItems:"center",
                paddingLeft:"10px", transition:"width 0.5s ease"
              }}>
                {pct > 15 && <span style={{ color:"#fff", fontSize:"12px", fontWeight:600 }}>{pct.toFixed(0)}%</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stale evaluations table ──────────────────────────────────────────────────
function StaleTable({ rows }) {
  if (!rows.length) return <EmptyState label="Aucune évaluation inactive" />;
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
        <thead>
          <tr style={{ background:"#f9fafb" }}>
            {["Organisme","Statut","Progression","Créée le","Jours inactifs"].map(h => (
              <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#6b7280", fontWeight:600, borderBottom:"1px solid #e5e7eb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((ev, i) => (
            <tr key={ev.id} style={{ borderBottom:"1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ padding:"10px 12px", color:"#374151", fontWeight:500 }}>{ev.organismeName}</td>
              <td style={{ padding:"10px 12px" }}>
                <span style={{ padding:"2px 8px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background: STATUS_COLORS[ev.status] + "20", color: STATUS_COLORS[ev.status] || "#6b7280" }}>
                  {ev.status}
                </span>
              </td>
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ flex:1, background:"#e5e7eb", borderRadius:"4px", height:"6px" }}>
                    <div style={{ width:`${ev.progression || 0}%`, background:"#3b82f6", height:"100%", borderRadius:"4px" }} />
                  </div>
                  <span style={{ color:"#6b7280", minWidth:"32px" }}>{ev.progression || 0}%</span>
                </div>
              </td>
              <td style={{ padding:"10px 12px", color:"#6b7280" }}>{ev.dateCreation || "—"}</td>
              <td style={{ padding:"10px 12px" }}>
                <span style={{ color: ev.daysInactive > 60 ? "#ef4444" : "#f59e0b", fontWeight:600 }}>{ev.daysInactive}j</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Refused criteria table ───────────────────────────────────────────────────
function RefusedCriteresTable({ rows }) {
  if (!rows.length) return <EmptyState label="Aucun critère refusé" />;
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
        <thead>
          <tr style={{ background:"#f9fafb" }}>
            {["Critère","Refus","Top commentaire"].map(h => (
              <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#6b7280", 
                fontWeight:600, borderBottom:"1px solid #e5e7eb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={c.critereId} style={{ borderBottom:"1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ padding:"10px 12px", color:"#374151", fontWeight:500, maxWidth:"220px" }}>{c.name}</td>
              <td style={{ padding:"10px 12px" }}>
                <span style={{ padding:"2px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:700, background:"#fee2e2", color:"#ef4444" }}>{c.count}</span>
              </td>
              <td style={{ padding:"10px 12px", color:"#6b7280", fontStyle:"italic", maxWidth:"300px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {c.comments[0] || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Drill-down refused list ──────────────────────────────────────────────────
function OrgRefusedList({ rows }) {
  if (!rows.length) return <EmptyState label="Aucun critère refusé pour cet organisme" />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ padding:"12px 14px", background:"#fef2f2", borderRadius:"8px", borderLeft:"3px solid #ef4444" }}>
          <div style={{ fontWeight:600, color:"#374151", fontSize:"13px", marginBottom:"4px" }}>{r.critere}</div>
          {r.commentaire !== "—" && <div style={{ color:"#6b7280", fontSize:"12px", fontStyle:"italic" }}>💬 {r.commentaire}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Completion ranking bar ───────────────────────────────────────────────────
function CompletionBar({ name, progression, score, scoreMax, statut }) {
  const scorePct = score && scoreMax ? ((score / scoreMax) * 100).toFixed(0) : null;
  return (
    <div style={{ marginBottom:"12px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
        <span style={{ fontSize:"13px", color:"#374151", fontWeight:500, maxWidth:"60%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</span>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          {scorePct && <span style={{ fontSize:"12px", color:"#6b7280" }}>Score: {scorePct}%</span>}
          <span style={{ padding:"2px 8px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background:(STATUS_COLORS[statut]||"#9ca3af")+"20", color: STATUS_COLORS[statut]||"#9ca3af" }}>{statut}</span>
        </div>
      </div>
      <div style={{ background:"#f3f4f6", borderRadius:"6px", height:"10px", overflow:"hidden" }}>
        <div style={{ width:`${progression}%`, height:"100%", background: progression === 100 ? "#10b981" : progression > 50 ? "#3b82f6" : "#f59e0b", borderRadius:"6px", transition:"width 0.4s ease" }} />
      </div>
      <span style={{ fontSize:"11px", color:"#9ca3af" }}>{progression}% traité</span>
    </div>
  );
}

// ─── Tab navigation ───────────────────────────────────────────────────────────
const TABS = [
  { id:"overview",    label:"Vue d'ensemble",        icon:"📊" },
  { id:"analyses",    label:"Analyse des réponses",  icon:"🔍" },
  { id:"suivi",       label:"Suivi & Certification", icon:"📋" },
  { id:"organisme",   label:"Par organisme",         icon:"🏢" },
];

function TabNav({ active, onSelect }) {
  return (
    <div style={{ display:"flex", gap:"4px", marginBottom:"24px", background:"#fff", padding:"6px", borderRadius:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.08)", width:"fit-content" }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => onSelect(tab.id)}
          style={{
            padding:"8px 18px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, transition:"all 0.15s",
            background: active === tab.id ? "#1f2937" : "transparent",
            color: active === tab.id ? "#fff" : "#6b7280",
          }}>
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}

// Main Dashboard
export default function DashboardsEval() {
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [principesMap, setPrincipesMap] = useState({});
  const [criteresMap, setCriteresMap] = useState({});
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0, totalOrganismes: 0,
    totalPrincipes: 0, totalPratiques: 0, totalCriteres: 0,
  });

  // ── Raw data ─────────────────────────────────────────────────────────────────
  const [listEvals,  setListEvals]  = useState([]);
  const [latestEvalsByOrganisme, setLatestEvalsByOrganisme] = useState([]);
  const [responses,  setResponses]  = useState([]);
  const [rawScores,  setRawScores]  = useState([]);
  const [organismes, setOrganismes] = useState([]);
  const [allOrganismeTypes,    setAllOrganismeTypes]    = useState([]);
  const [allOrganismeSecteurs, setAllOrganismeSecteurs] = useState([]);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [filterDateFrom,  setFilterDateFrom]  = useState("");
  const [filterDateTo,    setFilterDateTo]    = useState("");
  const [filterOrgType,   setFilterOrgType]   = useState("all");
  const [filterOrgSecteur,setFilterOrgSecteur]= useState("all");

  const handleReset = () => {
    setFilterDateFrom(""); setFilterDateTo("");
    setFilterOrgType("all"); setFilterOrgSecteur("all");
  };

  const valeurLabels = { 0:"n'existe pas", 1:"en cours", 2:"réalisé", 3:"validé" };

  // ── Filtered base sets ───────────────────────────────────────────────────────
  const filteredEvals = useMemo(() => {
    return listEvals.filter(ev => {
      const raw = ev.dateTermination || ev.dateSoumission || ev.dateCreation;
      const dateStr = raw ? raw.substring(0, 10) : null;
      if (filterDateFrom && dateStr && dateStr < filterDateFrom) return false;
      if (filterDateTo   && dateStr && dateStr > filterDateTo)   return false;
      if (filterOrgType    !== "all" && ev.organismeType    !== filterOrgType)    return false;
      if (filterOrgSecteur !== "all" && ev.organismeSecteur !== filterOrgSecteur) return false;
      return true;
    });
  }, [listEvals, filterDateFrom, filterDateTo, filterOrgType, filterOrgSecteur]);

  // Latest eval per organisme (from filteredEvals)
  /*const latestEvalsByOrganisme = useMemo(() => {
    const map = {};
    filteredEvals.forEach(ev => {
      const orgId = ev.organismeId;
      const date  = ev.dateTermination || ev.dateCreation || "";
      const existing = map[orgId];
      if (!existing || date > (existing.dateTermination || existing.dateCreation || "")) {
        map[orgId] = ev;
      }
    });
    return Object.values(map);
  }, [filteredEvals]);
  console.log("latest evals ",latestEvalsByOrganisme);*/

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const dateStr = r.evalDate ? r.evalDate.substring(0, 10) : null;
      if (filterDateFrom && dateStr && dateStr < filterDateFrom) return false;
      if (filterDateTo   && dateStr && dateStr > filterDateTo)   return false;
      if (filterOrgType    !== "all" && r.organismeType    !== filterOrgType)    return false;
      if (filterOrgSecteur !== "all" && r.organismeSecteur !== filterOrgSecteur) return false;
      return true;
    });
  }, [responses, filterDateFrom, filterDateTo, filterOrgType, filterOrgSecteur]);

  // Responses scoped to latest evals only
  const latestResponses = useMemo(() => {
    const ids = new Set(latestEvalsByOrganisme.map(ev => ev.id));
    return filteredResponses.filter(r => ids.has(r.evaluationId));
  }, [filteredResponses, latestEvalsByOrganisme]);

  //Dimension lists 
  const filteredOrganismeTypes = useMemo(() =>
    [...new Set(latestEvalsByOrganisme.map(ev => ev.organismeType || "undefined"))],
  [latestEvalsByOrganisme]);

  const orgIdToType = useMemo(() => {
    const map = {};
    organismes.forEach(o => { map[o.id] = o.type; });
    return map;
  }, [organismes]);

  //Tab 1: Vue d'ensemble////////////////////////////////////
  const scoreMoyen = useMemo(() => {
    if (!latestEvalsByOrganisme.length) return "—";
    const total = latestEvalsByOrganisme.reduce((sum, ev) =>
      sum + (ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0), 0);
    return (total / latestEvalsByOrganisme.length).toFixed(1) + "%";
  }, [latestEvalsByOrganisme]);

  const organismeData = useMemo(() => {
    const map = latestEvalsByOrganisme.reduce((acc, ev) => {
      const k = ev.organismeType || "undefined";
      if (!acc[k]) acc[k] = { total: 0, count: 0 };
      acc[k].total += ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0;
      acc[k].count++;
      return acc;
    }, {});
    return Object.entries(map).map(([organismeType, d]) => ({ organismeType, averageScore: d.total / d.count }));
  }, [latestEvalsByOrganisme]);

  const secteurData = useMemo(() => {
    const map = latestEvalsByOrganisme.reduce((acc, ev) => {
      const k = ev.organismeSecteur || "undefined";
      if (!acc[k]) acc[k] = { total: 0, count: 0 };
      acc[k].total += ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0;
      acc[k].count++;
      return acc;
    }, {});
    return Object.entries(map).map(([secteur, d]) => ({ secteur, averageScore: d.total / d.count }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [latestEvalsByOrganisme]);

  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: "0–20%", min: 0,  max: 20,  count: 0, fill: "#ef4444" },
      { range: "20–40%",min: 20, max: 40,  count: 0, fill: "#f97316" },
      { range: "40–60%",min: 40, max: 60,  count: 0, fill: "#f59e0b" },
      { range: "60–80%",min: 60, max: 80,  count: 0, fill: "#3b82f6" },
      { range: "80–100%",min:80, max: 101, count: 0, fill: "#10b981" },
    ];
    latestEvalsByOrganisme.forEach(ev => {
      const pct = ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0;
      const b = buckets.find(b => pct >= b.min && pct < b.max) || buckets[4];
      b.count++;
    });
    return buckets;
  }, [latestEvalsByOrganisme]);

  const monthData = useMemo(() => {
    if (!filteredEvals.length) return [];
    const dict = filteredEvals.reduce((acc, ev) => {
      const raw  = ev.dateTermination || ev.dateSoumission || ev.dateCreation;
      const mois = raw ? raw.substring(0, 7) : "undefined";
      const type = ev.organismeType || "undefined";
      const score = ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0;
      if (!acc[mois]) acc[mois] = {};
      if (!acc[mois][type]) acc[mois][type] = { total: 0, count: 0 };
      acc[mois][type].total += score;
      acc[mois][type].count++;
      return acc;
    }, {});
    return Object.entries(dict).map(([mois, types]) => {
      const row = { mois };
      Object.entries(types).forEach(([type, d]) => { row[type] = d.total / d.count; });
      return row;
    }).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [filteredEvals]);

  const filteredDonutDataLabels = useMemo(() => {
    const map = latestEvalsByOrganisme.reduce((acc, ev) => {
      const k = ev.label ?? "Non évalué";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [latestEvalsByOrganisme]);

  //Tab 2: Analyse des réponses///////////////////////
  const filteredChartDataReponse = useMemo(() => {
    const map = latestResponses.reduce((acc, r) => {
      const k = r.valeur ?? "undefined";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(map).map(([k, count]) => ({ name: valeurLabels[k] || k, count }));
  }, [latestResponses]);

  const pieData = useMemo(() => [
    { name:"Validé", value: latestResponses.filter(r => r.statut?.toLowerCase() === "validé").length },
    { name:"Refusé", value: latestResponses.filter(r => r.statut?.toLowerCase() === "refusé").length },
  ], [latestResponses]);

  const chartData = useMemo(() => {
    const latestOrgIds = new Set(latestEvalsByOrganisme.map(ev => ev.organismeId));
    const filtered = rawScores.filter(item => {
      if (!latestOrgIds.has(item.organismeId)) return false;
      if (filterOrgType !== "all") return orgIdToType[item.organismeId] === filterOrgType;
      return true;
    });
    const map = {};
    filtered.forEach(item => {
      const pid = item.principeId;
      if (!map[pid]) map[pid] = [];
      map[pid].push(item.score || 0);
    });
    return Object.entries(map).map(([pid, arr]) => ({
      name: principesMap[pid] || `Principe ${pid}`,
      score: arr.reduce((a, b) => a + b, 0) / arr.length
    }));
  }, [rawScores, filterOrgType, orgIdToType, principesMap, latestEvalsByOrganisme]);

  const scoresParPrincipeParType = useMemo(() => {
    const latestOrgIds = new Set(latestEvalsByOrganisme.map(ev => ev.organismeId));
    const filtered = rawScores.filter(item => {
      if (!latestOrgIds.has(item.organismeId)) return false;
      if (filterOrgType !== "all") return orgIdToType[item.organismeId] === filterOrgType;
      return true;
    });
    const grouped = filtered.reduce((acc, item) => {
      const p = principesMap[item.principeId] || `P${item.principeId}`;
      const t = orgIdToType[item.organismeId] || "undefined";
      const score = item.scoreMax ? (item.score / item.scoreMax) * 100 : 0;
      if (!acc[p]) acc[p] = {};
      if (!acc[p][t]) acc[p][t] = { total: 0, count: 0 };
      acc[p][t].total += score;
      acc[p][t].count++;
      return acc;
    }, {});
    return Object.entries(grouped).map(([principe, types]) => {
      const result = { principe };
      Object.entries(types).forEach(([typeOrg, d]) => { result[typeOrg] = d.total / d.count; });
      return result;
    });
  }, [rawScores, filterOrgType, orgIdToType, principesMap, latestEvalsByOrganisme]);

  // Stacked reponses per principe
  const reponsesParPrincipe = useMemo(() => {
    const principesByCritere = {};
    Object.entries(criteresMap).forEach(([critereId, info]) => {
      principesByCritere[critereId] = info.principeName;
    });
    const map = {};
    latestResponses.forEach(r => {
      const princeName = principesByCritere[r.critereId] || "Autre";
      if (!map[princeName]) map[princeName] = { principe: princeName, 0: 0, 1: 0, 2: 0, 3: 0 };
      const v = r.valeur ?? "undefined";
      if (v in map[princeName]) map[princeName][v]++;
    });
    return Object.values(map);
  }, [latestResponses, criteresMap]);

  const criteresRefuses = useMemo(() => {
    const map = {};
    latestResponses.filter(r => r.statut?.toLowerCase() === "refusé").forEach(r => {
      const k = r.critereId;
      const name = (criteresMap[k] && criteresMap[k].nom) ? criteresMap[k].nom : (criteresMap[k] || `Critère ${k}`);
      if (!map[k]) map[k] = { critereId: k, name, count: 0, comments: [] };
      map[k].count++;
      if (r.commentaire) map[k].comments.push(r.commentaire);
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [latestResponses, criteresMap]);

  // Tab 3: Suivi & Certification//////////////////////////////
  const completionRanking = useMemo(() =>
    [...latestEvalsByOrganisme]
      .map(ev => ({ ...ev, name: ev.organismeName, progression: ev.progression || 0 }))
      .sort((a, b) => b.progression - a.progression),
  [latestEvalsByOrganisme]);

  const staleEvaluations = useMemo(() => {
    const now = new Date();
    return filteredEvals
      .filter(ev => ev.status !== "terminé")
      .map(ev => {
        const ref  = new Date(ev.dateCreation || now);
        const days = Math.floor((now - ref) / 86400000); //86400000 =1day
        return { ...ev, daysInactive: days };
      })
      .filter(ev => ev.daysInactive >= 15)
      .sort((a, b) => b.daysInactive - a.daysInactive);
  }, [filteredEvals]);

  const certificationFunnel = useMemo(() => {
    const total    = filteredEvals.length;
    const enCours  = filteredEvals.filter(ev => ev.status === "en cours").length;
    const termines = filteredEvals.filter(ev => ev.status === "terminé").length;
    const labelled = filteredEvals.filter(ev => ev.label && !["Non évalué"].includes(ev.label)).length;
    return [
      { name:"Évaluations soumises", value:total,    fill:"#3b82f6" },
      { name:"En cours de traitement",value:enCours,  fill:"#f59e0b" },
      { name:"Terminées",            value:termines,  fill:"#10b981" },
      { name:"Labellisées",          value:labelled,  fill:"#8b5cf6" },
    ];
  }, [filteredEvals]);

  const avgDaysToCompletion = useMemo(() => {
    const completed = filteredEvals.filter(ev => ev.dateTermination && ev.dateCreation);
    if (!completed.length) return null;
    const total = completed.reduce((sum, ev) => {
      const diff = new Date(ev.dateTermination) - new Date(ev.dateCreation);
      return sum + diff / 86400000;
    }, 0);
    return (total / completed.length).toFixed(0);
  }, [filteredEvals]);

  //Tab 4: Par organisme
  const uniqueOrganismes = useMemo(() => {
    const map = {};
    listEvals.forEach(ev => {
      if (ev.organismeId && !map[ev.organismeId]) {
        map[ev.organismeId] = ev.organismeName;
      }
    });
    return Object.entries(map).map(([id, name]) => ({ id: Number(id), name }));
  }, [listEvals]);

  const orgAllEvals = useMemo(() =>
    selectedOrgId ? listEvals.filter(ev => ev.organismeId === selectedOrgId) : [],
  [selectedOrgId, listEvals]);

  const orgEvolutionData = useMemo(() =>
    [...orgAllEvals]
      .sort((a, b) => (a.dateCreation || "").localeCompare(b.dateCreation || ""))
      .map((ev, i) => ({
        index: `Eval ${i + 1}(${ev.dateUpdate || ev.dateCreation || ""})`,
        date:  ev.dateTermination || ev.dateCreation || "",
        score: ev.score && ev.scoreMax ? +((ev.score / ev.scoreMax) * 100).toFixed(1) : 0,
        label: ev.label,
      })),
  [orgAllEvals]);

  const orgRadarData = useMemo(() => {
    if (!selectedOrgId) return [];
    const grouped = {};

    rawScores
      .filter(s => s.organismeId === selectedOrgId)
      .forEach(s => {
        const principeNom = principesMap[s.principeId];
        if (!principeNom) return null;
        const pct = s.scoreMax ? (s.score / s.scoreMax) * 100 : 0;
        if (!grouped[principeNom]) grouped[principeNom] = { total: 0, count: 0 };
        grouped[principeNom].total += pct;
        grouped[principeNom].count++;
      });
        return Object.entries(grouped).map(([principe, d]) => ({
          principe,
          score: +(d.total / d.count).toFixed(1),
          fullMark: 100,
        }));
}, [selectedOrgId, rawScores, principesMap]);

  // Replace 0 scores with a small minimum just for display
  const radarDisplayData = useMemo(() =>
  orgRadarData.map(d => ({ ...d, score: d.score === 0 ? 1 : d.score })),
[orgRadarData]);
  

  /*const orgRadarData = useMemo(() => {
    if (!selectedOrgId) return [];
    const grouped = {};

    rawScores
      .filter(s => s.organismeId === selectedOrgId)
      .forEach(s => {
        const pid = s.principeId;

        if (!grouped[pid]) {
          grouped[pid] = { total: 0, count: 0 };
        }

        const pct = s.scoreMax ? (s.score / s.scoreMax) * 100 : 0;
        grouped[pid].total += pct;
        grouped[pid].count++;
      });

    return Object.entries(grouped).map(([pid, d]) => ({
      principe: principesMap[pid] || `P${pid}`,
      score: +(d.total / d.count).toFixed(1),
      fullMark: 100,
    }));
  }, [selectedOrgId, rawScores, principesMap]);*/

  const orgRefusedCriteres = useMemo(() => {
    if (!selectedOrgId) return [];
    const orgEvalIds = new Set(latestEvalsByOrganisme.filter(ev => ev.organismeId === selectedOrgId) //filter les réponses
    .map(ev => ev.id)); //extrat seulement les ids
    return responses
      .filter(r => orgEvalIds.has(r.evaluationId) && r.statut?.toLowerCase() === "refusé")
      .map(r => {
        const info = criteresMap[r.critereId];
        const nom  = (info && info.nom) ? info.nom : (info || `Critère ${r.critereId}`);
        return { critere: nom, commentaire: r.commentaire || "—", valeur: r.valeur };
      });
  }, [selectedOrgId, listEvals, responses, criteresMap]);

  const selectedOrgInfo = useMemo(() => {
    if (!selectedOrgId) return null;
      return latestEvalsByOrganisme.find(
      ev => ev.organismeId === selectedOrgId
      ) || null;
  }, [selectedOrgId, latestEvalsByOrganisme]);

  //Data fetching///////////////////////////
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allRes, latestRes] = await Promise.all([
          axios.get(`${backendUrl}/evaluation/all/treated`, { withCredentials: true }),
          axios.get(`${backendUrl}/evaluation/all/latest/treated`, { withCredentials: true }),
        ]);
        setListEvals(allRes.data);  // used for: monthData, orgAllEvals, staleEvals
        setLatestEvalsByOrganisme (latestRes.data); //used for everything else
          console.log("latest evals: ",latestRes.data);
        const types    = [...new Set(allRes.data.map(ev => ev.organismeType    || "undefined"))];
        const secteurs = [...new Set(latestRes.data.map(ev => ev.organismeSecteur || "undefined"))];
        setAllOrganismeTypes(types);
        setAllOrganismeSecteurs(secteurs);
      } catch { toast.error("Erreur lors du chargement des évaluations"); }
      finally  { setLoading(false); }
    };
    fetchData();
  }, [backendUrl]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const evRes = await axios.get(`${backendUrl}/evaluation/all/treated`, { withCredentials: true });
        const evals = evRes.data;
        const arrays = await Promise.all(
          evals.map(evalItem =>
            axios.get(`${backendUrl}/evaluation/${evalItem.id}/reponses`, { withCredentials: true })
              .then(res => {
                const reps = Array.isArray(res.data.reponses) ? res.data.reponses : [];
                return reps.map(r => ({
                  ...r,
                  organismeType:    evalItem.organismeType,
                  organismeSecteur: evalItem.organismeSecteur,
                  evalDate:         evalItem.dateTermination || evalItem.dateSoumission || evalItem.dateCreation,
                  evaluationId:     evalItem.id,        // ← required for latestResponses filtering
                }));
              })
          )
        );
        setResponses(arrays.flat());
      } catch { toast.error("Erreur lors du chargement des réponses"); }
    };
    fetchResponses();
  }, [backendUrl]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${backendUrl}/users`, { withCredentials: true });
        const users = Array.isArray(res.data) ? res.data : res.data.users || [];
        setStats(prev => ({ ...prev, totalUsers: users.filter(u => u.role !== "ADMIN" && u.role !== "EVALUATEUR").length }));
      } catch {}
    };
    fetchUsers();
  }, [backendUrl]);

  useEffect(() => {
    const fetchOrganismes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/organismes`, { withCredentials: true });
        setOrganismes(res.data);
        const filtered = res.data.filter(o => o.responsable?.role !== "ADMIN" && o.responsable?.role !== "EVALUATEUR");
        setStats(prev => ({ ...prev, totalOrganismes: filtered.length }));
      } catch {}
    };
    fetchOrganismes();
  }, [backendUrl]);

  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`, { withCredentials: true });
        const mapped = res.data.map(p => ({
          ...p,
          pratiques: (p.pratiques || []).map(pr => ({
            ...pr,
            criteres: (pr.criteres || []).map(c => ({ ...c }))
          }))
        }));
        // Build principes map
        const pmap = {};
        mapped.forEach(p => { pmap[p.id] = p.nom; });
        setPrincipesMap(pmap);

        // Build criteres map: critereId → { nom, principeName }
        const cmap = {};
        mapped.forEach(p => {
          (p.pratiques || []).forEach(pr => {
            (pr.criteres || []).forEach(c => {
              cmap[c.id] = { nom: c.nom || c.label, principeName: p.nom };
            });
          });
        });
        setCriteresMap(cmap);

        setStats(prev => ({
          ...prev,
          totalPrincipes: mapped.length,
          totalPratiques: mapped.reduce((s, p) => s + (p.pratiques?.length || 0), 0),
          totalCriteres:  mapped.reduce((s, p) => s + (p.pratiques?.reduce((ss, pr) => ss + (pr.criteres?.length || 0), 0) || 0), 0),
        }));
      } catch (err) { console.error(err); }
    };
    fetchPrincipes();
  }, [backendUrl]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get(`${backendUrl}/scoreParPrincipe/scores`, { withCredentials: true });
        setRawScores(res.data);
      } catch {}
    };
    fetchScores();
  }, [backendUrl]);

  //Grid helpers
  const grid2 = { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(500px, 1fr))", gap:"20px", marginBottom:"24px" };
  const grid1 = { display:"grid", gridTemplateColumns:"1fr", gap:"20px", marginBottom:"24px" };

  if (loading) {
    return (
      <div style={{ display:"flex" }}>
        <SidebarAdmin />
        <div style={{ flex:1, padding:20, marginLeft:"250px", display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh" }}>
          <div style={{ color:"#6b7280" }}>Chargement...</div>
        </div>
      </div>
    );
  }

  // RENDER
  return (
    <div style={{ display:"flex", minHeight:"100vh", backgroundColor:"#f3f4f6" }}>
      <SidebarAdmin />

      <div style={{ flex:1, marginLeft:"250px", padding:"20px", overflowX:"auto" }}>

        {/* Header */}
        <div style={{ marginBottom:"20px" }}>
          <h1 style={{ fontSize:"28px", fontWeight:"bold", color:"#1f2937", marginBottom:"4px" }}>📊 Tableau de bord</h1>
          <p style={{ color:"#6b7280" }}>Aperçu des statistiques et performances de gouvernance</p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filterDateFrom={filterDateFrom}   setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo}       setFilterDateTo={setFilterDateTo}
          filterOrgType={filterOrgType}     setFilterOrgType={setFilterOrgType}
          filterOrgSecteur={filterOrgSecteur} setFilterOrgSecteur={setFilterOrgSecteur}
          organismeTypes={allOrganismeTypes}  organismesSecteurs={allOrganismeSecteurs}
          onReset={handleReset}
        />

        {/* Tab navigation */}
        <TabNav active={activeTab} onSelect={setActiveTab} />

            {/*TAB 1 — Vue d'ensemble*/}
        {activeTab === "overview" && (
          <>
            {/* KPI cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"16px", marginBottom:"28px" }}>
              <StatCard title="👤 Responsables"     value={stats.totalUsers} />
              <StatCard title="🏢 Organismes"       value={stats.totalOrganismes} />
              <StatCard title="📄 Organismes évalués" value={latestEvalsByOrganisme.length} />
              <StatCard title="📊 Score moyen"      value={scoreMoyen} />
              <StatCard
                title="📌 Référentiel"
                value={
                  <div style={{ display:"flex", flexDirection:"column", gap:"4px", textAlign:"center", fontSize:"14px" }}>
                    <span>{stats.totalPrincipes} principes</span>
                    <span>{stats.totalPratiques} pratiques</span>
                    <span>{stats.totalCriteres} critères</span>
                  </div>
                }
              />
            </div>

            <div style={grid2}>
              {/* Score par type d'organisme */}
              <ChartCard title="Score moyen par type d'organisme" subtitle="Dernière évaluation par organisme">
                {organismeData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={organismeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="organismeType" interval={0} angle={-20} textAnchor="end" tick={{ fontSize:12 }} />
                      <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={v => `${v.toFixed(1)}%`} />
                      <Bar dataKey="averageScore" radius={[4,4,0,0]} name="Score moyen">
                        {organismeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>

              {/* Score par secteur */}
              <ChartCard title="Score moyen par secteur d'activité" subtitle="Dernière évaluation par organisme">
                {secteurData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={secteurData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0,100]} tickFormatter={v=>`${v}%`} />
                      <YAxis type="category" dataKey="secteur" width={110} tick={{ fontSize:11 }} />
                      <Tooltip formatter={v => `${v.toFixed(1)}%`} />
                      <Bar dataKey="averageScore" radius={[0,4,4,0]} name="Score moyen">
                        {secteurData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>

              {/* Distribution des scores */}
              <ChartCard title="Distribution des scores" subtitle="Répartition des organismes par tranche de score">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4,4,0,0]} name="Organismes">
                      {scoreDistribution.map((b, i) => <Cell key={i} fill={b.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Répartition des labels */}
              <ChartCard title="Répartition des labels" subtitle="Dernière évaluation par organisme">
                {filteredDonutDataLabels.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={filteredDonutDataLabels} dataKey="count" nameKey="name"
                        cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {filteredDonutDataLabels.map((d, i) => (
                          <Cell key={i} fill={LABEL_COLORS[d.name] || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>
            </div>

            {/* Évolution mensuelle — full width — all evals */}
            <ChartCard title="📈 Évolution des scores par mois" subtitle="Toutes les évaluations (historique complet)" style={{ marginBottom:"24px" }}>
              {monthData.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} />
                    <Tooltip formatter={v=>`${v.toFixed(1)}%`} />
                    <Legend />
                    {filteredOrganismeTypes.map((type, i) => (
                      <Line key={type} type="monotone" dataKey={type}
                        stroke={COLORS[i % COLORS.length]} strokeWidth={2}
                        dot={{ fill: COLORS[i % COLORS.length], r:3 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyState label="Pas encore de données temporelles" />}
            </ChartCard>
          </>
        )}

        {/* TAB 2 — Analyse des réponses*/}
        {activeTab === "analyses" && (
          <>
            <div style={grid2}>
              {/* Scores par principe */}
              <ChartCard title="Score moyen par principe">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" tick={{ fontSize:11 }} />
                      <YAxis domain={[0, d => Math.max(d * 1.1, 10)]} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[4,4,0,0]} name="Score moyen">
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>

              {/* Scores par principe par type */}
              <ChartCard title="Score par principe et type d'organisme">
                {scoresParPrincipeParType.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={scoresParPrincipeParType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="principe" interval={0} angle={-25} textAnchor="end" tick={{ fontSize:11 }} />
                      <YAxis domain={[0,100]} />
                      <Tooltip />
                      <Legend />
                      {filteredOrganismeTypes.map((type, i) => (
                        <Bar key={type} dataKey={type} fill={COLORS[i % COLORS.length]} radius={[4,4,0,0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>

              {/* Répartition des réponses (valeur) */}
              <ChartCard title="Répartition des réponses" subtitle="Par niveau de maturité déclaré">
                {filteredChartDataReponse.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredChartDataReponse} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, d => Math.max(d * 1.3, 5)]} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize:12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0,4,4,0]} name="Réponses">
                        {filteredChartDataReponse.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>

              {/* Décisions validé/refusé */}
              <ChartCard title="Répartition des décisions" subtitle="Validé vs refusé par l'évaluateur">
                {pieData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        outerRadius={100} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>
            </div>

            {/* Critères les plus refusés — full width */}
            <ChartCard title="🚫 Top 10 critères les plus refusés" subtitle="Signale les points de blocage structurels" style={{ marginBottom:"24px" }}>
              <RefusedCriteresTable rows={criteresRefuses} />
            </ChartCard>
          </>
        )}

        {/*TAB 3 — Suivi & Certification */}
        {activeTab === "suivi" && (
          <>
            {/* Mini KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"16px", marginBottom:"24px" }}>
              <StatCard title="⏱️ Durée moyenne" value={avgDaysToCompletion ? `${avgDaysToCompletion}j` : "—"} />
              <StatCard title="⚠️ Évals inactives (Non terminés)" value={staleEvaluations.length} />
              <StatCard title="✅ Terminées" value={filteredEvals.filter(ev => ev.status === "terminé").length} />
              <StatCard title="🏷️ Labellisées" value={filteredEvals.filter(ev => ev.label && !["Non évalué"].includes(ev.label)).length} />
            </div>

            <div style={grid2}>
              {/* Certification funnel */}
              <ChartCard title="🔽 Pipeline de certification" subtitle="De la soumission au label">
                <CertificationFunnel data={certificationFunnel} />
              </ChartCard>

              {/* Label distribution bar */}
              <ChartCard title="Répartition des labels par niveau" subtitle="Dernière évaluation par organisme">
                {filteredDonutDataLabels.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={filteredDonutDataLabels}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize:11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4,4,0,0]} name="Organismes">
                        {filteredDonutDataLabels.map((d, i) => (
                          <Cell key={i} fill={LABEL_COLORS[d.name] || COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </ChartCard>
            </div>

            {/* Taux de complétion ranking */}
            <ChartCard title="📶 Taux de complétion par organisme" subtitle="Triés par progression décroissante — dernière évaluation" style={{ marginBottom:"24px" }}>
              {completionRanking.length ? (
                <div style={{ maxHeight:"400px", overflowY:"auto", paddingRight:"8px" }}>
                  {completionRanking.map(ev => (
                    <CompletionBar key={ev.id}
                      name={ev.organismeName} progression={ev.progression}
                      score={ev.score} scoreMax={ev.scoreMax} statut={ev.status} />
                  ))}
                </div>
              ) : <EmptyState />}
            </ChartCard>

            {/* Stale evaluations table */}
            <ChartCard title="🕐 Évaluations inactives depuis +15 jours" subtitle="Évaluations non terminées sans activité récente">
              <StaleTable rows={staleEvaluations} />
            </ChartCard>
          </>
        )}

        {/* TAB 4 — Par organisme (drill-down)*/}
        {activeTab === "organisme" && (
          <>
            {/* Organisme selector */}
            <div style={{ background:"#fff", padding:"16px 20px", borderRadius:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.1)", marginBottom:"24px", display:"flex", alignItems:"center", gap:"16px" }}>
              <span style={{ fontWeight:600, color:"#374151", fontSize:"14px" }}>Sélectionner un organisme :</span>
              <select
                value={selectedOrgId || ""}
                onChange={e => setSelectedOrgId(e.target.value ? Number(e.target.value) : null)}
                style={{ padding:"8px 14px", border:"1px solid #d1d5db", borderRadius:"8px", fontSize:"13px", color:"#374151", background:"#fff", cursor:"pointer", outline:"none", minWidth:"260px" }}>
                <option value="">— Choisir un organisme —</option>
                {uniqueOrganismes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {selectedOrgInfo && (
                <div style={{ marginLeft:"auto", display:"flex", gap:"12px", alignItems:"center" }}>
                  <span style={{ padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:700,
                    background:(LABEL_COLORS[selectedOrgInfo.label]||"#6b7280")+"20",
                    color: LABEL_COLORS[selectedOrgInfo.label]||"#6b7280" }}>
                    🏷️ {selectedOrgInfo.label || "Non évalué"}
                  </span>
                  <span style={{ fontSize:"13px", color:"#6b7280" }}>
                    Score: <strong>{selectedOrgInfo.score && selectedOrgInfo.scoreMax
                      ? `${((selectedOrgInfo.score/selectedOrgInfo.scoreMax)*100).toFixed(1)}%` : "—"}</strong>
                  </span>
                  <span style={{ fontSize:"13px", color:"#6b7280" }}>
                    {orgAllEvals.length} évaluation{orgAllEvals.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {!selectedOrgId ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#9ca3af", background:"#fff", borderRadius:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>🏢</div>
                <div style={{ fontSize:"15px" }}>Sélectionnez un organisme pour voir son analyse détaillée</div>
              </div>
            ) : (
              <>
                <div style={grid2}>
                  {/* Score evolution */}
                  <ChartCard title="📈 Évolution du score" subtitle="Toutes les évaluations de cet organisme">
                    {orgEvolutionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={orgEvolutionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} />
                          <Tooltip
                            formatter={(v, _, props) => [`${v}%`, `Score — ${props.payload.label || ""}`]}
                            labelFormatter={l => l} />
                          <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5}
                            dot={{ fill:"#3b82f6", r:5 }} activeDot={{ r:7 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <EmptyState label="Pas d'historique disponible" />}
                  </ChartCard>

                  {/* Radar chart per principe */}
                  <ChartCard title="🕸️ Profil par principe" subtitle="Score de la dernière évaluation">
                    {orgRadarData.length ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={radarDisplayData} margin={{ top:10, right:30, bottom:10, left:30 }}>
  <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
  <PolarAngleAxis dataKey="principe" tick={{ fontSize:10, fill:"#475569" }} />
  <PolarRadiusAxis 
    domain={[0, 110]}
    tick={false}
    axisLine={false}
    tickCount={5}
  />
  <Radar 
    name="Score" 
    dataKey="score" 
    stroke="#3b82f6" 
    fill="#3b82f6" 
    fillOpacity={0.25}
    strokeWidth={2}
    dot={{ r:3, fill:"#3b82f6", strokeWidth:0 }}
    // ← baseValue removed
  />
  <Tooltip formatter={v => [`${v}%`, "Score"]} />
</RadarChart>
                      </ResponsiveContainer>
                    ) : <EmptyState label="Scores par principe non disponibles" />}
                  </ChartCard>
                </div>

                {/* Evaluations timeline */}
                <ChartCard title="📋 Historique des évaluations" style={{ marginBottom:"24px" }}>
                  <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                    {orgAllEvals.length ? orgAllEvals.map((ev, i) => (
                      <div key={ev.id} style={{
                        padding:"12px 16px", background:"#f9fafb", borderRadius:"10px",
                        border:`2px solid ${STATUS_COLORS[ev.status]||"#e5e7eb"}`,
                        minWidth:"160px", flex:"1"
                      }}>
                        <div style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px" }}>Évaluation {i+1}</div>
                        <div style={{ fontWeight:700, fontSize:"18px", color:"#1f2937" }}>
                          {ev.score && ev.scoreMax ? `${((ev.score/ev.scoreMax)*100).toFixed(0)}%` : "—"}
                        </div>
                        <div style={{ fontSize:"12px", color: LABEL_COLORS[ev.label]||"#6b7280", fontWeight:600, marginBottom:"4px" }}>{ev.label || "Non évalué"}</div>
                        <div style={{ fontSize:"11px", color:"#9ca3af" }}>{ev.dateTermination || ev.dateCreation || "—"}</div>
                        <span style={{ display:"inline-block", marginTop:"6px", padding:"2px 8px", borderRadius:"12px", fontSize:"10px", fontWeight:600,
                          background:(STATUS_COLORS[ev.status]||"#9ca3af")+"20", color:STATUS_COLORS[ev.status]||"#9ca3af" }}>
                          {ev.status}
                        </span>
                      </div>
                    )) : <EmptyState />}
                  </div>
                </ChartCard>

                {/* Refused criteria */}
                <ChartCard title="🚫 Critères refusés" subtitle="Sur la derniére evaluation de cet organisme">
                  <OrgRefusedList rows={orgRefusedCriteres} />
                </ChartCard>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}