/*import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';

const VerifyAccount = () => {
    const{backendUrl}=useContext(AppContext);
    const navigate = useNavigate();
    const [message, setMessage] = useState("Vérification en cours...");
    const [loading, setLoading] = useState(false);
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const handleSubmit= async(e)=>{
        e.preventDefault();
        
        try{
            setLoading(true);
            const cleanEmail = email.trim();
            const response =await axios.post(`${backendUrl}/register-from-demande/${encodeURIComponent(cleanEmail)}`, { password });
            const user = response.data;
            localStorage.setItem("user", JSON.stringify(user));
                toast.success("Inscription réussie !");
                navigate("/homepage");

                
        }catch(error){
            toast.error("email existe déja");
        }finally{
            setLoading(false);
        }
    }
    
    return (
    <div className="d-flex justify-content-center align-items-center"
      style={{height: "100vh",background: "linear-gradient(135deg,#f4f1ed,#e6dfd6)"}}>

      <div className="card border-0 shadow-lg"
        style={{width: "100%",maxWidth: "500px",borderRadius: "20px",padding: "30px"}}>
        <div className="card-body">
          <h2 className="text-center mb-4">
            validation
          </h2>

          <form>
              <div className="mb-4">
                <input className="form-control mb-3"
                    type="email"
                    placeholder="Email professionnel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                <input className="form-control"
                  type="password"
                  placeholder=" enregistrer mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading? "Chargement...":  "Se connecter"}
            </button>

          </form>
            </div>
        </div>
     </div> 
     ) 
};


export default VerifyAccount;*/



import React, { useState, useContext } from 'react';
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


  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast.error("Erreur lors de l'inscription !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", background: "linear-gradient(135deg,#f4f1ed,#e6dfd6)" }}>

      <div className="card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: "500px", borderRadius: "20px", padding: "30px" }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Validation</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                className="form-control mb-3"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                className="form-control"
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;