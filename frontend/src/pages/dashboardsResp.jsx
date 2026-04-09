import { TrendingUp, ClipboardCheck, Upload, Award, ChevronRight, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import Siderbar from "../components/siderbar";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useEffect, useState,useContext,useMemo } from "react";
import { useLocation } from "react-router-dom";

const monOrganisme = {
  nom: "Société Nationale d'Eau",
  type: "public",
  scoreGlobal: 85,
  label: "or",
  evaluationsCompletes: 10,
  evaluationsTotal: 12,
};

/*const scorePrincipes = [
  { principe: "Transparence", score: 90 },
  { principe: "Responsabilité", score: 80 },
  { principe: "Participation", score: 75 },
  { principe: "État de droit", score: 95 },
  { principe: "Efficacité", score: 85 },
  { principe: "Équité", score: 70 },
];*/

const principleColors = [
  "#6366f1", // Indigo
  "#0ea5e9", // Sky Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#3b82f6", // Blue
  "#22c55e", // Emerald
  "#eab308", // Yellow
  "#a855f7"  // Violet
];

function ProgressBar({ value, color, height = 6 }) {
  return (
    <div style={{ height, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${value}%`, borderRadius: 999,
        background: color,
        transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 10, padding: "8px 14px", fontSize: 13,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{payload[0]?.payload?.principe}</div>
      <div style={{ color: "#6366f1", fontWeight: 700 }}>{payload[0]?.value}%</div>
    </div>
  );
};

export default function DashboardResp() {
  const[user,setUser] = useState(null); // État pour stocker les informations de l'utilisateur
  const progress = Math.round((monOrganisme.evaluationsCompletes / monOrganisme.evaluationsTotal) * 100);
  const { backendUrl,userData } = useContext(AppContext);
  const location = useLocation();
  //const evaluation = location.state?.evaluation;
  const [scorePrincipes, setScorePrincipes] = useState([]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (!userData?.id) return; // safety check
        const response = await axios.get(`${backendUrl}/users/${userData?.id}`);
        setUser(response.data);
      } catch (error) {
        toast.error("Erreur chargement profil");
      } finally {
      }
    };
     console.log("UserData Context =", userData);
      console.log("UserData ID =", userData?.id);

    if (userData?.id) fetchInfo();
  }, [backendUrl,userData]);

  

  //fetch scores par principe pour une evaluation specifique
  /*useEffect(() => {
    const fetchScoresParPrincipesByEval = async () => {
        if(!evaluation) return;
      try {
        
        const resPrincipes = await axios.get(`${backendUrl}/principes`);
        const ListPrincipes=resPrincipes.data;
      // fetch scores for this evaluation
        const res = await axios.get(`${backendUrl}/scoreParPrincipe/${evaluation?.id}`);
        // map scores to include the actual principe name
        const scores = res.data.map(item => {
        const principeObj = ListPrincipes.find(p => p.id === item.principeId);
        //console.log("principeObj: ",principeObj);
        return {
          principe: principeObj ? principeObj.nom : `Principe ${item.principeId}` || "undefined",
          score: item.score ?? 0,
        };
      });
        
        setScorePrincipes(scores);
        console.log(scores);
      } catch (error) {
        console.error("Erreur chargement principes", error);
      }
    };
    fetchScoresParPrincipesByEval();
  }, [backendUrl,evaluation]);*/

  useEffect(() => {
  if (!userData?.organisme?.id) return;
  const fetchScoresParPrincipesByOrg = async () => {
    if (!userData?.organisme?.id) {
      console.log("Organisme ID missing:", userData?.organisme);
      return;
    }
    try {
      console.log("Fetching scores for organisme:", userData?.organisme?.id);
      const resPrincipes = await axios.get(`${backendUrl}/principes`);
      const ListPrincipes = resPrincipes.data;

      const res = await axios.get(`${backendUrl}/scoreParPrincipe/organisme/${userData?.organisme?.id}`);
      const scoresParOrg=res.data;

      const scores = scoresParOrg.length > 0 ? scoresParOrg.map(item => {
        const scoreMax = item.scoreMax;
        const principeObj = ListPrincipes.find(p => p.id === item.principeId);
        console.log("ListPrincipes IDs:", ListPrincipes.map(p => p.id));
        console.log("Score principe IDs:", scoresParOrg.map(s => s.principeId));
        return {
          principe: principeObj ? principeObj.nom : `Principe ${item.principeId}` || "undefined",
          score: Math.round((item.score/scoreMax)*100) ?? 0,
        };
      }) : ListPrincipes.map((p, i) => ({
        principe: p.nom,
        score: 0,
      }));
      setScorePrincipes(scores);
      console.log("scores: ",scores);
    } catch (error) {
      console.error("Erreur chargement principes", error);
    }
  };

  fetchScoresParPrincipesByOrg();
}, [backendUrl, userData]);


const scoresMoyen = useMemo(() => {
  const map = {};
  scorePrincipes.forEach(sp => {
    if (!map[sp.principe]) {
      map[sp.principe] = { total: sp.score, count: 1 };
    } else {
      map[sp.principe].total += sp.score;
      map[sp.principe].count += 1;
    }
  });
  const Scores=Object.entries(map).map(([principe, { total, count }]) => ({
    principe,
    score: Math.round(total / count),
  }));
  console.log("scores Moyen par principe: ",Scores);

  return Scores;
  
}, [scorePrincipes]);

if (user && user.etat !== "actif") {
  return (
    <>
      <Siderbar />
      <div style={{ marginLeft: "200px", padding: "40px" }}>
        <h2 style={{ color: "#ef4444" }}>Accès refusé</h2>
        <p>Votre compte est inactif. Vous ne pouvez pas accéder aux évaluations.</p>
      </div>
    </>
  );
}
  

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <div style={{ width: 250, flexShrink: 0 }}>
        <Siderbar />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 24 }}>
        
        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Radar Chart */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 16, padding: "22px 24px"
          }}>
            <div style={{ marginBottom: 4, fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Vue d'ensemble
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
              Scores par principe
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={scoresMoyen} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <PolarAngleAxis dataKey="principe" tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Principle bars */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 16, padding: "22px 24px"
          }}>
            <div style={{ marginBottom: 4, fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Détail
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>
              Résultats par principe
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {scoresMoyen.map((sp, i) => (
                <div key={sp.principe}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{sp.principe}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: principleColors[i] }}>{sp.score}%</span>
                  </div>
                  <ProgressBar value={sp.score} color={principleColors[i]} height={7} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}