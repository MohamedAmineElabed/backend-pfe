// pages/Dashboards.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import SidebarEval from "../../components/siderbarEval.jsx";
import StatCard from "../../components/evaluateur/statCard.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({filterDateFrom,setFilterDateFrom,filterDateTo,setFilterDateTo, 
  filterOrgType,setFilterOrgType,filterOrgSecteur,setFilterOrgSecteur,organismesSecteurs,organismeTypes,onReset}) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "12px",
      padding: "16px 20px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      marginBottom: "24px"
    }}>
      <span style={{ fontWeight: 600, color: "#374151", fontSize: "14px", marginRight: "4px" }}>Filtres</span>
      {/* Date From */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>Date début</label>
        <input
          type="date"
          value={filterDateFrom}
          onChange={e => setFilterDateFrom(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#374151",
            outline: "none",
            cursor: "pointer"
          }}
        />
      </div>

      {/* Date To */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>Date fin</label>
        <input
          type="date"
          value={filterDateTo}
          onChange={e => setFilterDateTo(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#374151",
            outline: "none",
            cursor: "pointer"
          }}
        />
      </div>

      {/* Organisme Type */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>Type d'organisme</label>
        <select
          value={filterOrgType}
          onChange={e => setFilterOrgType(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#374151",
            background: "#fff",
            cursor: "pointer",
            outline: "none",
            minWidth: "160px"
          }}
        >
          <option value="all">Tous les types</option>
          {organismeTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Organisme Secteur */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>Secteur d'activité</label>
        <select
          value={filterOrgSecteur}
          onChange={e => setFilterOrgSecteur(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#374151",
            background: "#fff",
            cursor: "pointer",
            outline: "none",
            minWidth: "160px"
          }}
        >
          <option value="all">Tous les secteurs</option>
          {organismesSecteurs.map(secteur => (
            <option key={secteur} value={secteur}>{secteur}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <label style={{ fontSize: "11px", color: "transparent" }}>.</label>
        <button
          onClick={onReset}
          style={{
            padding: "6px 14px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "13px",
            background: "#f9fafb",
            color: "#6b7280",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.target.style.background = "#f3f4f6"; e.target.style.color = "#374151"; }}
          onMouseLeave={e => { e.target.style.background = "#f9fafb"; e.target.style.color = "#6b7280"; }}
        >
          ✕ Réinitialiser
        </button>
      </div>

      {/* Active filters badge */}
      {(filterDateFrom || filterDateTo || filterOrgType !== "all" || filterOrgSecteur !== "all" ) && (
        <div style={{
          marginLeft: "auto",
          padding: "4px 10px",
          background: "#eff6ff",
          color: "#3b82f6",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
          border: "1px solid #bfdbfe"
        }}>
          Filtre actif
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardsEval() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvals: 0,
    totalPrincipes: 0,
    totalPratiques: 0,
    totalCriteres: 0,
    scoreMoyen: 0
  });
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [principesMap, setPrincipesMap] = useState({});

  // ── Raw data stores ──────────────────────────────────────────────────────────
  const [listEvals, setListEvals] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [responses, setResponses] = useState([]);
  const [rawScores, setRawScores] = useState([]);       // from /scoreParPrincipe/scores
  const [organismes, setOrganismes] = useState([]); // full organismes list
  const [allOrganismeTypes, setAllOrganismeTypes] = useState([]);
  const [allOrganismeSecteurs, setAllOrganismeSecteurs] = useState([]);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterOrgType, setFilterOrgType] = useState("all");
  const [filterOrgSecteur, setFilterOrgSecteur] = useState("all");

  const handleReset = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterOrgType("all");
    setFilterOrgSecteur("all");
  };

  const colors = [
    "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#f43f5e", "#a3e635"
  ];

  const valeurLabels = { 0: "n'existe pas", 1: "en cours", 2: "réalisé", 3: "validé" };

  // Filtered evaluations
  const filteredEvals = useMemo(() => {
    return listEvals.filter(ev => {
      const raw = ev.dateTermination || ev.dateSoumission;
      const dateStr = raw ? raw.substring(0, 10) : null;
      if (filterDateFrom && dateStr && dateStr < filterDateFrom) return false;
      if (filterDateTo && dateStr && dateStr > filterDateTo) return false;
      if (filterOrgType !== "all" && ev.organismeType !== filterOrgType) return false;
      if (filterOrgSecteur !== "all" && ev.organismeSecteur !== filterOrgSecteur) return false;
      return true;
    });
  }, [listEvals, filterDateFrom, filterDateTo, filterOrgType,filterOrgSecteur]);

  // Filtered demandes
  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      const dateStr = d.dateCreation ? d.dateCreation.substring(0, 10) : null;
      if (filterDateFrom && dateStr && dateStr < filterDateFrom) return false;
      if (filterDateTo && dateStr && dateStr > filterDateTo) return false;
      return true;
    });
  }, [demandes, filterDateFrom, filterDateTo]);

  // Filtered responses (have organismeType + evalDate attached at fetch time)
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const dateStr = r.evalDate ? r.evalDate.substring(0, 10) : null;
      if (filterDateFrom && dateStr && dateStr < filterDateFrom) return false;
      if (filterDateTo && dateStr && dateStr > filterDateTo) return false;
      if (filterOrgType !== "all" && r.organismeType !== filterOrgType) return false;
      if (filterOrgSecteur !== "all" && r.organismeSecteur !== filterOrgSecteur) return false;

      return true;
    });
  }, [responses, filterDateFrom, filterDateTo, filterOrgType,filterOrgSecteur]);

  //////////////// Derived chart data (all computed from filtered sources)

  // Organisme types present in current filtered set (for legend keys)
  const filteredOrganismeTypes = useMemo(() => {
    return [...new Set(filteredEvals.map(ev => ev.organismeType || "undefined"))];
  }, [filteredEvals]);

  // Organisme types present in current filtered set (for legend keys)
  const filteredOrganismeSecteurs = useMemo(() => {
    return [...new Set(filteredEvals.map(ev => ev.organismeSecteur || "undefined"))];
  }, [filteredEvals]);

  // Score moyen par type d'organisme
  const organismeData = useMemo(() => {
    const orgScores = filteredEvals.reduce((acc, ev) => {
      const orgType = ev.organismeType || "undefined";
      const score = ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0;
      if (!acc[orgType]) acc[orgType] = { total: 0, count: 0 };
      acc[orgType].total += score;
      acc[orgType].count += 1;
      return acc;
    }, {});
    return Object.entries(orgScores).map(([orgType, data]) => ({
      organismeType: orgType,
      averageScore: data.total / data.count,
    }));
  }, [filteredEvals]);

  // Monthly evolution
  const monthData = useMemo(() => {
    if (!filteredEvals || filteredEvals.length === 0) return [];
    const dict = filteredEvals.reduce((acc, ev) => {
      const raw = ev.dateTermination || ev.dateSoumission;
      const mois = raw ? raw.substring(0, 7) : "undefined";
      const typeOrg = ev.organismeType || "undefined";
      const score = ev.score && ev.scoreMax ? (ev.score / ev.scoreMax) * 100 : 0;
      if (!acc[mois]) acc[mois] = {};
      if (!acc[mois][typeOrg]) acc[mois][typeOrg] = { total: 0, count: 0 };
      acc[mois][typeOrg].total += score;
      acc[mois][typeOrg].count += 1;
      return acc;
    }, {});
    return Object.entries(dict).map(([mois, types]) => {
      const row = { mois };
      Object.entries(types).forEach(([type, data]) => { row[type] = data.total / data.count; });
      return row;
    }).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [filteredEvals]);

  // Labels donut (filtered by org type + date via filteredEvals)
  const filteredDonutDataLabels = useMemo(() => {
    const map = filteredEvals.reduce((acc, ev) => {
      const key = ev.label ?? "undefined";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(map).map(([key, count]) => ({ name: key, count }));
  }, [filteredEvals]);

  // Répartition des réponses (valeur)
  const filteredChartDataReponse = useMemo(() => {
    const map = filteredResponses.reduce((acc, p) => {
      const key = p.valeur ?? "undefined";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(map).map(([key, count]) => ({
      name: valeurLabels[key] || key,
      count
    }));
  }, [filteredResponses]);

  // Pie: décisions validé/refusé
  const pieData = useMemo(() => {
    const resValidé = filteredResponses.filter(r => r.statut?.toLowerCase() === "validé").length;
    const resRefusé = filteredResponses.filter(r => r.statut?.toLowerCase() === "refusé").length;
    return [
      { name: "Validé", value: resValidé },
      { name: "Refusé", value: resRefusé },
    ];
  }, [filteredResponses]);

  // Scores par principe (raw scores filtered by org type via organismeId→type map)
  const orgIdToType = useMemo(() => {
    const map = {};
    organismes.forEach(o => { map[o.id] = o.type; });
    return map;
  }, [organismes]);

  const chartData = useMemo(() => {
    const filtered = rawScores.filter(item => {
      if (filterOrgType !== "all") return orgIdToType[item.organismeId] === filterOrgType;
      return true;
    });
    const scoresData = {};
    filtered.forEach(item => {
      const pid = item.principeId;
      if (!scoresData[pid]) scoresData[pid] = [];
      scoresData[pid].push(item.score || 0);
    });
    return Object.entries(scoresData).map(([pid, arr]) => ({
      name: principesMap[pid] || `Principe ${pid}`,
      score: arr.reduce((a, b) => a + b, 0) / arr.length
    }));
  }, [rawScores, filterOrgType, orgIdToType, principesMap]);

  // Scores par principe par type d'organisme
  const scoresParPrincipeParType = useMemo(() => {
    const filtered = rawScores.filter(item => {
      if (filterOrgType !== "all") return orgIdToType[item.organismeId] === filterOrgType;
      return true;
    });
    const valeurs = filtered.map(item => ({
      principe: principesMap[item.principeId],
      typeOrg: orgIdToType[item.organismeId],
      score: item.scoreMax ? (item.score / item.scoreMax) * 100 : 0
    }));
    const grouped = valeurs.reduce((acc, item) => {
      if (!acc[item.principe]) acc[item.principe] = {};
      if (!acc[item.principe][item.typeOrg]) acc[item.principe][item.typeOrg] = { total: 0, count: 0 };
      acc[item.principe][item.typeOrg].total += item.score;
      acc[item.principe][item.typeOrg].count += 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([principe, types]) => {
      const result = { principe };
      Object.entries(types).forEach(([typeOrg, data]) => {
        result[typeOrg] = data.total / data.count;
      });
      return result;
    });
  }, [rawScores, filterOrgType, orgIdToType, principesMap]);

  //////////////// Data fetching

  // Fetch demandes
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/demandes`, { withCredentials: true });
        setDemandes(res.data);
      } catch (err) {
        toast.error("Erreur lors de la récupération des demandes");
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
  }, [backendUrl]);

  // Fetch evaluations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const evaluations = await axios.get(`${backendUrl}/evaluation/all/treated`, { withCredentials: true });
        const evaluationsRes = evaluations.data;
        console.log("raw evaluations: ",evaluations.data);
        setListEvals(evaluationsRes);
        setStats(prev => ({ ...prev, totalEvals: evaluationsRes.length }));
        const types = [...new Set(evaluationsRes.map(ev => ev.organismeType || "undefined"))];
        const secteurs = [...new Set(evaluationsRes.map(ev => ev.organismeSecteur || "undefined"))];
        setAllOrganismeTypes(types);
        setAllOrganismeSecteurs(secteurs);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      }
    };
    fetchData();
  }, [backendUrl]);

  // Fetch responses — attach eval context for filtering
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const evaluationsRes = await axios.get(`${backendUrl}/evaluation/all/treated`, { withCredentials: true });
        const evaluations = evaluationsRes.data;
        const allResponsesArrays = await Promise.all(
          evaluations.map(evalItem =>
            axios.get(`${backendUrl}/evaluation/${evalItem.id}/reponses`, { withCredentials: true })
              .then(res => {
                const reps = Array.isArray(res.data.reponses) ? res.data.reponses : [];
                // Attach eval context to each response for filtering
                return reps.map(r => ({
                  ...r,
                  organismeType: evalItem.organismeType,
                  evalDate: evalItem.dateTermination || evalItem.dateSoumission,
                  organismeSecteur: evalItem.organismeSecteur
                }));
              })
          )
        );
        setResponses(allResponsesArrays.flat());
        console.log("raw reponses: ",allResponsesArrays);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      }
    };
    fetchResponses();
  }, [backendUrl]);

  // Fetch users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await axios.get(`${backendUrl}/users`, { withCredentials: true });
        const userArray = Array.isArray(users.data) ? users.data : users.data.users || [];
        const filteredUsers = userArray.filter(u => u.role !== "ADMIN" && u.role !== "EVALUATEUR");
        setStats(prev => ({ ...prev, totalUsers: filteredUsers.length }));
      } catch (err) {
        toast.error("Erreur lors du chargement des données");
      }
    };
    fetchData();
  }, [backendUrl]);

  // Fetch organismes 
  useEffect(() => {
    const fetchOrganismes = async () => {
      try {
        const response = await axios.get(`${backendUrl}/organismes`, { withCredentials: true });
        setOrganismes(response.data);
        const filtered = response.data.filter(
          org => org.responsable?.role !== "ADMIN" && org.responsable?.role !== "EVALUATEUR"
        );
        setStats(prev => ({ ...prev, totalOrganismes: filtered.length }));
      } catch (err) {
        toast.error("Erreur lors du chargement des organismes");
      }
    };
    fetchOrganismes();
  }, [backendUrl]);

  // Fetch principes
  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`, { withCredentials: true });
        const mapped = res.data.map(p => ({
          ...p,
          label: p.nom,
          pratiques: (p.pratiques || []).map(pr => ({
            ...pr,
            label: pr.nom,
            criteres: (pr.criteres || []).map(c => ({ ...c, label: c.nom }))
          }))
        }));
        const map = {};
        mapped.forEach(p => { map[p.id] = p.nom; });
        setPrincipesMap(map);
        setStats(prev => ({
          ...prev,
          totalPrincipes: mapped.length,
          totalPratiques: mapped.reduce((s, p) => s + (p.pratiques?.length || 0), 0),
          totalCriteres: mapped.reduce(
            (s, p) => s + (p.pratiques?.reduce((ss, pr) => ss + (pr.criteres?.length || 0), 0) || 0), 0
          )
        }));
      } catch (err) {
        console.error("Erreur chargement principes", err);
      }
    };
    fetchPrincipes();
  }, [backendUrl]);

  // Fetch raw scoreParPrincipe scores
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get(`${backendUrl}/scoreParPrincipe/scores`, { withCredentials: true });
        setRawScores(res.data);
      } catch (err) {
        console.error("Erreur chargement scores", err);
      }
    };
    fetchScores();
  }, [backendUrl]);

  const getStatusColor = (etat) => {
    switch (etat) {
      case 'validé': return '#10b981';
      case 'refusé': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <SidebarEval />
        <div style={{
          flex: 1, padding: 20, marginLeft: '250px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'
        }}>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <SidebarEval />

      <div style={{ flex: 1, marginLeft: '250px', padding: '20px', overflowX: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            📊 Tableau de bord
          </h1>
          <p style={{ color: '#6b7280' }}>Aperçu des statistiques et performances</p>
        </div>

        {/* ── Filter Bar ── */}
        <FilterBar
          filterDateFrom={filterDateFrom}
          setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo}
          setFilterDateTo={setFilterDateTo}
          filterOrgType={filterOrgType}
          setFilterOrgType={setFilterOrgType}
          filterOrgSecteur={filterOrgSecteur}
          setFilterOrgSecteur={setFilterOrgSecteur}
          organismeTypes={allOrganismeTypes}
          organismesSecteurs={allOrganismeSecteurs}
          onReset={handleReset}
        />

        {/* KPI CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <StatCard title="👤 Responsables" value={stats.totalUsers} />
          <StatCard title="🏢 Organismes" value={stats.totalOrganismes} />
          <StatCard title="📄 Evaluations totales" value={filteredEvals.length} />
          <StatCard
            title="📌 Principes"
            value={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', fontSize: '15px' }}>
                <span>Principes: {stats.totalPrincipes}</span>
                <span>Pratiques: {stats.totalPratiques}</span>
                <span>Critères: {stats.totalCriteres}</span>
              </div>
            }
          />
        </div>

        {/* CHARTS SECTION */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>

          {/* Bar Chart: Scores par principe */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Scores Moyens par principe</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" />
                <YAxis domain={[0, dataMax => dataMax * 1.1]} />
                <Tooltip />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Scores par type d'organisme */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Scores Moyens par type d'organisme</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={organismeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="organismeType" interval={0} angle={-30} textAnchor="end" />
                <YAxis domain={[0, dataMax => dataMax * 1.1]} />
                <Tooltip />
                <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                  {organismeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Répartition des réponses */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Répartition des réponses</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredChartDataReponse} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, dataMax => dataMax * 1.5]} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {filteredChartDataReponse.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Score par principe par type */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Score moyen par principe et type d'organisme</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoresParPrincipeParType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="principe" interval={0} angle={-30} textAnchor="end" />
                <YAxis domain={[0, dataMax => dataMax * 1.1]} />
                <Tooltip />
                {filteredOrganismeTypes.map((type, index) => (
                  <Bar key={type} dataKey={type} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart: Évolution mensuelle */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", width: "100%" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>📈 Évolution des scores d'évaluation par mois</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  {filteredOrganismeTypes.map((type, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={type}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length] }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* SECOND ROW */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px"
        }}>

          {/* Pie: décisions */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Répartition des décisions</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut: labels */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Répartition des labels</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredDonutDataLabels}
                    dataKey="count"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {filteredDonutDataLabels.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}