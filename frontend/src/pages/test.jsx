import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import Siderbar from "../components/siderbar";


const Evaluation = () => {
  const { backendUrl, userData } = useContext(AppContext); // userData comes from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  //const [currentOrg, setCurrentOrg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If userData exists, fetch fresh user info from backend
    if (userData?.id) {
      const fetchCurrentUser = async () => {
        try {
          const res = await axios.get(`${backendUrl}/users/${userData.id}`);
          setCurrentUser(res.data);
          /*const resOrg = await axios.get(`${backendUrl}/organismes/${userData.id}`);
          setCurrentOrg(resOrg.data);*/
        } catch (err) {
          console.error("Erreur fetching current organisme:", err);
        }
      };
      fetchCurrentUser();
    }
  }, [backendUrl, userData]);

  /*const startEvaluation = async () => {
    const organismeId = currentUser?.organisme?.id;
    const responsableId=currentUser?.id;
    if (!organismeId) return alert("Organisme introuvable pour l'utilisateur !");
    try {
      const res = await axios.post(`${backendUrl}/evaluation/new`, { organismeId,responsableId });
      console.log("Nouvelle évaluation créée :", res.data);
      navigate("/evaluationForm", { state: { currentUser, evaluationId: res.data} });
    } catch (err) {
      console.error("Erreur lors de la création de l'évaluation", err);
    }
  };*/
    const startEvaluation=async()=>{
      if (!currentUser) return alert("Utilisateur introuvable !");
      console.log("current user: ",currentUser);
      // Pass currentUser to EvaluationForm via location state
      navigate("/evaluationForm", { state: { currentUser } });
    }

  return (<>

    <button
      onClick={startEvaluation}
      //onClick={navigate("/evaluationForm", { state: { currentUser, evaluationId: res.data} })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Nouvelle évaluation
    </button>
    </>
  );
};

export default Evaluation;