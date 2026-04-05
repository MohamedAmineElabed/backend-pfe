// pages/Dashboards.jsx
import { useEffect, useState,useContext,useMemo } from "react";
import axios from "axios";
import SiderbarEval from "../../components/SiderbarEval.jsx";
import StatCard from "../../components/evaluateur/statCard.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";

import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function DashboardsEval() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvals: 0,
    totalPrincipes:0,
    totalPratiques:0,
    totalCriteres:0,
    scoreMoyen:0
  });
  const { backendUrl } = useContext(AppContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [principesMap, setPrincipesMap] = useState({});

  const valeurLabels = {
  0: "n'existe pas",
  1: "en cours",
  2: "réalisé",
  3: "validé",
};
  const [values, setValues] = useState({});
  const chartDataReponse = useMemo(() => {    //to transform dictionaaire to array 
  return Object.entries(values).map(([key, count]) => ({
    name: valeurLabels[key] || key,
    count: count
  }));
}, [values]);


  const[evals,setEvals]=useState({});
  const donutDataLabels = useMemo(() => {    //to transform dictionaaire to array 
  return Object.entries(evals).map(([key, count]) => ({
    name: key,
    count: count
  }));
}, [evals]);


  const [responses,setResponses]=useState([]);
  const colors = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#a3e635"
];

  // Fetch evaluation
  useEffect(() => {
  const fetchData = async () => {
    try {
        const evaluations = await axios.get(`${backendUrl}/evaluation/all/treated`);
        console.log(evaluations.data);
        const evaluationsRes=evaluations.data;
        setStats(prev=> ({
          ...prev,
          totalEvals: evaluations.data.length,
        }));

        const map=evaluationsRes.reduce((acc,ev)=>{
        const key=ev.label ??"undefined";
        acc[key] = (acc[key] || 0) + 1; // Increment count for this valeur
        return acc;
      },{});
        setEvals(map);
        console.log("Map of labels:" ,map);
        setLoading(false);
        console.log("Total evaluations:", evaluations.data.length);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    }
  };
  fetchData();
}, [backendUrl]);

  //fetch reponses
  useEffect(() => {
  const fetchResponses = async () => {
    try {
        const evaluationsRes = await axios.get(`${backendUrl}/evaluation/all/treated`);
        const evaluations=evaluationsRes.data;
         // Fetch all responses in parallel
        const allResponsesArrays = await Promise.all(
          evaluations.map(evalItem => 
            axios.get(`${backendUrl}/evaluation/${evalItem.id}/reponses`)
            .then(res => Array.isArray(res.data.reponses) ? res.data.reponses : [])
          
        )
        
      );
      
      const allResponses = allResponsesArrays.flat(); // Flatten all responses into a single array
      setResponses(allResponses);
      const map=allResponses.reduce((acc,p)=>{
        const key=p.valeur ??"undefined";
        acc[key] = (acc[key] || 0) + 1; // Increment count for this valeur
        return acc;
      },{});
      setValues(map);
      console.log("Map of counts:" ,map);
      console.log("responses: ",allResponses)
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    }
  };
  fetchResponses();
}, [backendUrl]);


    // Fetch utilisateurs
  useEffect(() => {
  const fetchData = async () => {
    try {
        const users = await axios.get(`${backendUrl}/users`);
        const userArray = Array.isArray(users.data) ? users.data : users.data.users || [];
        const filteredUsers = userArray.filter(user => user.role !== "ADMIN" && user.role !== "EVALUATEUR");
        console.log(filteredUsers);
        setStats(prev=> ({
          ...prev,
          totalUsers: filteredUsers.length,
        }));
        setLoading(false);
        console.log("Total users:", filteredUsers.length);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    }
  };
  fetchData();
}, [backendUrl]);

    // fetch organismes
    useEffect(() => {
        const fetchOrganismes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/organismes`);
      const filteredOrganismes = response.data.filter(org => org.responsable?.role !== "ADMIN" && org.responsable?.role !== "EVALUATEUR");    //org.responsable?.role iptional chaing pour verifier si le responsable existe ou non
        setStats(prev => ({
            ...prev,
            totalOrganismes: filteredOrganismes.length

        }));
        setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error("Erreur lors du chargement des organismes");
            }
        };
        fetchOrganismes();
    }, [backendUrl]);

    //fetch principe/pratiques/criteres
  useEffect(() => {
    const fetchPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/principes`);
        const mappedPrincipes = res.data.map((principe) => ({
          ...principe,
          label: principe.nom,
          pratiques: (principe.pratiques || []).map((p) => ({
            ...p,
            label: p.nom,
            criteres: (p.criteres || []).map((c) => ({
              ...c,
              label: c.nom,
            })),
          })),
        }));

        const map={};//
        mappedPrincipes.forEach(p => {map[p.id]=p.nom});
        setPrincipesMap(map);


        setStats(prev=> ({
          ...prev,
          totalPrincipes: mappedPrincipes.length,
          totalPratiques:mappedPrincipes.reduce((sum, p) => sum + (p.pratiques?.length || 0),0),
          totalCriteres:mappedPrincipes.reduce(
        (sum, p) => sum + (p.pratiques?.reduce((subSum, pratique) => subSum + (pratique.criteres?.length || 0), 0) || 0),
        0
      )
        }));
      } catch (error) {
        console.error("Erreur chargement principes", error);
      }
    };
    fetchPrincipes();
  }, [backendUrl]);

  //fetch scores par principes
  useEffect(() => {
    const fetchScoresParPrincipes = async () => {
      try {
        const res = await axios.get(`${backendUrl}/scoreParPrincipe/scores`);
        const scoresData={};
        res.data.forEach(item=>{
          const pid=item.principeId; //pid is the principe id
          if (!scoresData[pid]) scoresData[pid] = [];
          scoresData[pid].push(item.score || 0); // Handle null scores as 0 
        });
        const scores = Object.entries(scoresData).map(([pid, scoresArray]) => ({ 
          name: principesMap[pid] || `Principe ${pid}`,
          score: scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length // Average score
        }));
        setChartData(scores);
        console.log("score moyen per principe ",scores);
       
    
        
      } catch (error) {
        console.error("Erreur chargement principes", error);
      }
    };
    fetchScoresParPrincipes();
  }, [backendUrl, principesMap]);


  const pieData=useMemo(()=>{
    const resValidé=responses.filter(r=>r.statut?.toLowerCase()==="validé").length;
    const resRefusé=responses.filter(r=>r.statut?.toLowerCase()==="refusé").length;
    //const autres=responses.length - resValidé - resRefusé;
    return [
    { name: "Validé", value: resValidé },
    { name: "Refusé", value: resRefusé },
    //{ name: "En attente", value: autres }
  ];


  },[responses]);

  // Sample data for recent requests
  const recentRequests = [
    { id: 1, name: "Demande A", status: "Validé", date: "2024-01-15" },
    { id: 2, name: "Demande B", status: "Refusé", date: "2024-01-14" },
    { id: 3, name: "Demande C", status: "En attente", date: "2024-01-13" },
    { id: 4, name: "Demande D", status: "Validé", date: "2024-01-12" },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Validé': return '#10b981';
      case 'Refusé': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <SiderbarEval />
        <div style={{ 
          flex: 1, 
          padding: 20, 
          marginLeft: '250px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <SiderbarEval />
      
      <div style={{ 
        flex: 1, 
        marginLeft: '250px', // Adjust based on your sidebar width
        padding: '20px',
        overflowX: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            📊 Tableau de bord
          </h1>
          <p style={{ color: '#6b7280'}}>
            Aperçu des statistiques et performances
          </p>
        </div>

        {/* KPI CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <StatCard title="👤 Responsables" value={stats.totalUsers} />
          <StatCard title="🏢 Organismes" value={stats.totalOrganismes} />
          <StatCard title="📄 Evaluations totales" value={stats.totalEvals} />
          <StatCard title="📌 Principes"   
          value={<div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', fontSize: '15px' }}>
            <span>Principes: {stats.totalPrincipes}</span>
            <span>Pratiques: {stats.totalPratiques}</span>
            <span>Critères: {stats.totalCriteres}</span>
    </div>}/>
          
          {/*<StatCard title=" Demandes totales" value={stats.totalDemandes} />
          <StatCard title=" Demandes acceptées" value={stats.accepted} />
          <StatCard title=" Demandes refusées" value={stats.refused} />*/}
        </div>

        {/* CHARTS SECTION */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>


          {/* Bar Chart */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "inline-block"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Scores Moyens par principe</h3>
            <div style={{ width: "100%", minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}
                  //margin={{ top: 10, right: 20, left: 10, bottom: 100 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" 
                        interval={0}   // forces all labels to show
                        angle={-30}    // optional: rotate labels if crowded
                        textAnchor="end"
                        />
                  <YAxis domain={[0, (dataMax) => dataMax * 1.1]} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Répartition des réponses</h3>
            <div style={{ height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataReponse} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number"
                          domain={[0, (dataMax) => dataMax * 1.5]} // 50% extra space
                  />
                  <YAxis type="category" dataKey="name"/>
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartDataReponse.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Line Chart */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>
              📈 Évolution des demandes
            </h3>
            <div style={{ height: 300,minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          
        </div>

        {/* SECOND ROW CHARTS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px"
        }}>
          {/* Pie Chart */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Répartition des décisions</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name"
                    cx="50%" 
                    cy="50%" 
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


          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Répartition des labels</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={donutDataLabels} 
                    dataKey="count" 
                    nameKey="name"
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    innerRadius={50}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {donutDataLabels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Requests Table */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>
              📋 Dernières demandes
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: "14px"
              }}>
                <thead>
                  <tr style={{ 
                    borderBottom: "2px solid #e5e7eb",
                    textAlign: "left"
                  }}>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>ID</th>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Nom</th>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Date</th>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px 8px" }}>{request.id}</td>
                      <td style={{ padding: "12px 8px", fontWeight: "500" }}>
                        {request.name}
                      </td>
                      <td style={{ padding: "12px 8px", color: "#6b7280" }}>
                        {request.date}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: `${getStatusColor(request.status)}20`,
                          color: getStatusColor(request.status)
                        }}>
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <button style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}>
                Voir toutes les demandes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}