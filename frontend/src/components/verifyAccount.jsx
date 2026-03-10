import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';

const VerifyAccount = () => {
  const { backendUrl,setUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  // Extract email from query param
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email"); // <-- this is the email from the link
  //verifier structure de mot de passe
    //const [passwordErrors, setPasswordErrors] = useState([]);


  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  //Verifier si l'email existe déja
  useEffect(() => {
    if (!email) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`${backendUrl}/check-email`, {
          params: { email }
        });
        if (res.data.exists) {
          toast.error("Un compte avec cet email existe déjà !");
          setEmailExists(true);
        }
      } catch (e) {
        console.log("Erreur check email", e);
      }
    }, 500); // délai pour éviter trop de requêtes
    return () => clearTimeout(timeout);
  }, [email]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email invalide !");
    return;
  }
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      setLoading(true);
      const cleanEmail = email.trim();
      //const response = await axios.post(`${backendUrl}/register-from-demande`, { password });
      const response =await axios.post(`${backendUrl}/register-from-demande/${encodeURIComponent(cleanEmail)}`, { password });
      const user = response.data;

      localStorage.setItem("userData", JSON.stringify(user));
      setUserData(user);
      console.log(localStorage.getItem("userData"));
      toast.success("Inscription réussie ! Welcome");
      navigate("/homepage");
    } catch (error) {
      let message = error.response?.data || "Erreur serveur";
        if (typeof message === "object") {
          message = Object.values(message)[0]; // take the first message
      }
        if (message.toLowerCase().includes("already exists")) {
          toast.error("Un compte avec cet email existe déjà !");
        } else if (message.toLowerCase().includes("faible") || message.toLowerCase().includes("weak")) {
            toast.error("Mot de passe faible");
              } else {
                  toast.error(message || "Erreur serveur");
                }
    }finally{
      setLoading(false); //so the button dosen't stuck on "en chargement" after an error 
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", background: "linear-gradient(135deg,#f4f1ed,#e6dfd6)" }}>

      <div className="card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: "500px", borderRadius: "20px", padding: "30px" }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Terminez la création de votre compte</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                className="form-control mb-3"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={emailExists}
                required
              />

              <input
                className="form-control"
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={emailExists}
                required
              />
              <small className="text-muted d-block mb-3 mt-2">
                    Le mot de passe doit contenir :
                    <ul className="mb-0 ms-3">
                      <li>Au moins 8 caractères</li>
                      <li>Au moins une lettre majuscule</li>
                      <li>Au moins une lettre minuscule</li>
                      <li>Au moins un chiffre</li>
                      <li>Au moins un caractère spécial</li>
                    </ul>
                  </small>
            </div>
            {!emailExists ?
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
            :<button
              type="submit"
              className="btn btn-primary w-100"
              onClick={() => navigate("/login")}
            >
              Retourner à login
            </button>};
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;