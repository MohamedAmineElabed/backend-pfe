// pages/Dashboards.jsx
import { useEffect, useState,useContext,useMemo } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/siderbarAdmin.jsx";
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

export default function DashboardsAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvals: 0,
    totalPrincipes:0,
    totalPratiques:0,
    totalCriteres:0,
    scoreMoyen:0
  });
  const { backendUrl } = useContext(AppContext);
  const navigate=useNavigate();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [principesMap, setPrincipesMap] = useState({});
  const [organismeData, setOrganismeData] = useState([]);
  const [scoresParPrincipeParType,setScoresParPrincipeParType]=useState([]);
  const [evolutionData,setEvolutionData]=useState([]);
  const [demandes, setDemandes] = useState([]);
  const [isEmpty,setIsEmpty]=useState(true);
  const [listEvals,setListEvals]=useState([]);
  const [monthData, setMonthData] = useState([]);
  const [organismeTypes, setOrganismeTypes] = useState([]);

  

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
  const donutDataLabels = useMemo(() => {    //to transform dictionaire to array 
  return Object.entries(evals).map(([key, count]) => ({
    name: key,
    count: count
  }));
}, [evals]);


  const [responses,setResponses]=useState([]);
  const colors = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#a3e635"
];


  //fetch demandes
  useEffect(()=>{
    const fetchDemandes=async() =>{
    try{
        setLoading(true);
        const demandes = await axios.get(`${backendUrl}/demandes`);
        setDemandes(demandes.data);
        console.log("demandes: ",demandes.data);
        setIsEmpty(demandes.data.length === 0);

    }catch(err){
        toast.error("Erreur lors de la récupération des demandes");
    }finally{
        setLoading(false);
    }
  }; fetchDemandes();
  },[backendUrl]);
  
  // Fetch evaluation
  const calculerScoreParMois=(listEvals)=>{
    if(!listEvals || listEvals.length===0) return 0;
    const dict=listEvals.reduce((acc,ev)=>{
      const rawDate = ev.dateTermination || ev.dateSoumission;
      console.log("RAW DATE =", ev.dateTermination);

      //const dateObj = new Date(rawDate);
      //const mois = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`; 
      const mois = rawDate.substring(0, 7); 
      const typeOrg=ev.organismeType || "undefined";    
      const score=ev.score && ev.scoreMax ? (ev.score/ev.scoreMax)*100 : 0;
      //const score=ev.score ? ev.score : 0;

      /*if(!acc[mois]){
        acc[mois]={total:0,count:0};
      }
      acc[mois].total+=score;
      acc[mois].count+=1;
      return acc;*/
      if (!acc[mois]) acc[mois] = {};
      if (!acc[mois][typeOrg]) acc[mois][typeOrg] = { total: 0, count: 0 };

      acc[mois][typeOrg].total += score;
      acc[mois][typeOrg].count += 1;

      return acc;

    },{});
    /*return Object.entries(dict).map(([mois,data])=>({
      mois,
      score: data.total / data.count
    })).sort((a, b) => new Date(a.mois) - new Date(b.mois));*/
    return Object.entries(dict).map(([mois, types]) => {
      const row = { mois };
      Object.entries(types).forEach(([type, data]) => {
        row[type] = data.total / data.count;
      });
      return row;
    })
    .sort((a, b) => a.mois.localeCompare(b.mois));

  }
  useEffect(() => {
  const fetchData = async () => {
    try {
        const evaluations = await axios.get(`${backendUrl}/evaluation/all/treated`);
        console.log(evaluations.data);
        setListEvals(evaluations.data);
        const evaluationsRes=evaluations.data;
        const scoresParMois=calculerScoreParMois(evaluationsRes);
        console.log("month data: ",scoresParMois);
        setMonthData(scoresParMois);

          /*if(!evaluationsRes || evaluationsRes.length===0) return 0;
          const total=evaluationsRes.reduce((acc,ev)=>{
            const avg=ev.score && ev.scoreMax ? (ev.score/ev.scoreMax)*100 : 0;
            return acc+avg;
          })
          const scoreG=total / evaluationsRes.length;
          return scoreG;*/
  
        setStats(prev=> ({
          ...prev,
          totalEvals: evaluations.data.length,
        }));

        const types = [...new Set(evaluationsRes.map(ev => ev.organismeType || "undefined"))];
        setOrganismeTypes(types);
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
        console.log("evaluations: ",evaluations);
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



  useEffect(()=>{
    const fetchScoresParOrganismeType=async()=>{
      try{
        const evaluationsRes = await axios.get(`${backendUrl}/evaluation/all/treated`);
        const evaluations=evaluationsRes.data;

        const orgScores=evaluations.reduce((acc,ev)=>{
          const orgType=ev.organismeType || "undefined";
          const score=ev.score && ev.scoreMax ? (ev.score/ev.scoreMax)*100 : 0;

          if (!acc[orgType]) {
          acc[orgType] = { total: 0, count: 0 };
        }

        acc[orgType].total += score;
        acc[orgType].count += 1;
        return acc;
        },{});
        const moyenneParOrganisme = Object.entries(orgScores).map(([orgType, data]) => ({
          organismeType: orgType,
          averageScore: data.total / data.count,
        }));
        console.log("Score moyen par organisme:", moyenneParOrganisme);
        setOrganismeData(moyenneParOrganisme);
      }catch(error){
        console.error(err);
        toast.error("Erreur lors du calcul des scores par organisme");
      }
    };
    fetchScoresParOrganismeType();
  },[backendUrl]);


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

  useEffect(()=>{
    const fetchScoresParTypeEtPrincipe=async()=>{
      try {
      const [resPrincipes,resScores,resOrganismes] = await Promise.all([
        axios.get(`${backendUrl}/principes`),
        axios.get(`${backendUrl}/scoreParPrincipe/scores`),
        axios.get(`${backendUrl}/organismes`)
      ]);
      const principes=resPrincipes.data;
      const scores=resScores.data;
      const organismes=resOrganismes.data;
      
      // maps car le tableau ne contient pas type org et nom principe mais les id
      const principeMap = {};
      principes.forEach(p => {
        principeMap[p.id] = p.nom;
      });
      const orgMap = {};
      organismes.forEach(o => {
        orgMap[o.id] = o.type;
      });
      const valeurs=scores.map(item=>({
        principe: principeMap[item.principeId],
        typeOrg: orgMap[item.organismeId],
        score: (item.score/item.scoreMax)*100
      }))
      console.log("map: ",valeurs);

      const grouped = valeurs.reduce((acc, item) => {
        if (!acc[item.principe]) {
          acc[item.principe] = {};
        }
        if (!acc[item.principe][item.typeOrg]) {
          acc[item.principe][item.typeOrg] = { total: 0, count: 0 };
        }

        acc[item.principe][item.typeOrg].total += item.score;
        acc[item.principe][item.typeOrg].count += 1;

        return acc;
      }, {});
      const chartData = Object.entries(grouped).map(([principe,types]) => {
        const result = { principe};
        /*Object.keys(row).forEach(key => {
          if (key !== "principe") {
            result[key] = row[key].total / row[key].count;
          }
        });*/
        Object.entries(types).forEach(([typeOrg, data]) => {
        result[typeOrg] = data.total / data.count;
      });
        return result;
      });

      console.log("FINAL CHART:", chartData);
      setScoresParPrincipeParType(chartData);
      }catch(error){
        console.error(err);
        toast.error("Erreur lors du calcul des scores par organisme");
      }
    };
    fetchScoresParTypeEtPrincipe();
  },[backendUrl]);

  const getStatusColor = (etat) => {
    switch(etat) {
      case 'validé': return '#10b981';
      case 'refusé': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <SidebarAdmin/>
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
      <SidebarAdmin />
      
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

          {/* Bar Chart 2 */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "inline-block"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Scores Moyens par type d'organisme</h3>
            <div style={{ width: "100%", minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={organismeData}
                  //margin={{ top: 10, right: 20, left: 10, bottom: 100 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="organismeType" 
                        interval={0}   // forces all labels to show
                        angle={-30}    // optional: rotate labels if crowded
                        textAnchor="end"
                        />
                  <YAxis domain={[0, (dataMax) => dataMax * 1.1]} />
                  <Tooltip />
                  <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                    {organismeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart 3 */}
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

          {/* Bar Chart 4 */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "inline-block"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>Score moyen par principe et type d'organisme</h3>
            <div style={{ width: "100%", minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoresParPrincipeParType}
                  //margin={{ top: 10, right: 20, left: 10, bottom: 100 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="principe" 
                        interval={0}   // forces all labels to show
                        angle={-30}    // optional: rotate labels if crowded
                        textAnchor="end"
                        />
                  <YAxis domain={[0, (dataMax) => dataMax * 1.1]} />
                  <Tooltip />
                  {organismeTypes.map((type,index)=>(
                  <Bar dataKey={type} radius={[4, 4, 0, 0]}>
                    {scoresParPrincipeParType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                  </Bar>
                ))};
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>




          {/* Line Chart */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            width:"100%"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#374151" }}>📈 Évolution des scores d'évalution par mois</h3>
            <div style={{ height: 300,minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  {organismeTypes.map((type,index)=>(
                    <Line 
                    key={index}
                    type={type}
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
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Organisme</th>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Responsable</th>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Date</th>
                    <th style={{ padding: "12px 8px", color: "#6b7280" }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {!isEmpty}
                  {demandes.sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
                  .slice(0, 10) //dix 10 premiers demandes
                  .map((demande) => (
                    <tr key={demande.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px 8px" }}>{demande.id}</td>
                      <td style={{ padding: "12px 8px", fontWeight: "500" }}>
                        {demande.nomOrganisme}
                      </td>
                      <td style={{ padding: "12px 8px", color: "#6b7280" }}>
                        {demande.nom}
                      </td>
                      <td style={{ padding: "12px 8px", color: "#6b7280" }}>
                        {demande.dateCreation}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: `${getStatusColor(demande.etat)}20`,
                          color: getStatusColor(demande.etat)
                        }}>
                          {demande.etat}
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
              }}
                onClick={()=>{navigate("/listDemandes")}}
                >
                Voir toutes les demandes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}