import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';

const Login = () => {

  const [iscreateAccount, setIsCreateAccount] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [typeOrganisme, setTypeOrganisme] = useState('');
  const [role, setRole] = useState('');
  const [telephone, setTelephone] = useState('');

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCodeModal, setShowCodeModal] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { backendUrl, setIsloggedIn, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const phoneRegex = /^[0-9]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    axios.defaults.withCredentials = true;
    setError('');
    setLoading(true);

    try {

      if (iscreateAccount) {
        console.log("Backend URL =", backendUrl);
        if (!phoneRegex.test(telephone)) {
          toast.error("Le téléphone doit contenir uniquement des chiffres");
          return;
        }
        const response = await axios.post(`${backendUrl}/demandes/registerDemande`,
          { nom, prenom, email, organisme, typeOrganisme, role, telephone }
        );

        if (response.status === 201) {
          setUserData(response.data);
          setIsloggedIn(true);
          toast.success("Inscription réussie !");
        }

      } else {

        const response = await axios.post(
          `${backendUrl}/login`,
          { email, password }
        );

        if (response.status === 200) {

          setUserData(response.data);
          localStorage.setItem("userData",JSON.stringify(response.data));
          setIsloggedIn(true);
          navigate('/homePageAdmin');
          toast.success("Connexion réussie !");
        }
      }

    } catch (err) {

      toast.error(
        err?.response?.data?.message ||
        "Erreur serveur"
      );

    } finally {
      setLoading(false);
    }
  };

const handleForgotPassword=async()=>{
  if (!email || email.trim() === "") {
    toast.error("Veuillez saisir votre email");
    return;
  }
  try{
      const response = await axios.post(`${backendUrl}/email/send-reset-otp`,{email});
      toast.success("Votre code a été envoyer par email");
      setShowCodeModal(true);
    }catch (error) {
      console.log(error);
      toast.error("Email n'existe pas");
      setShowCodeModal(false);
  }
}

const verifyOtp=async()=>{
     try{
      const response = await axios.post(`${backendUrl}/verify-otp`,{
        email: email,
        otp: otp,
      });
      toast.success("OTP validé!");
      setShowCodeModal(false);
      setShowResetModal(true);
    }catch(error){
       console.log(error);
      toast.error(error.response?.data || "Code invalide");
    }
  }

const handleResetPassword=async()=>{
  try{
      const response = await axios.post(`${backendUrl}/reset-password`,{
        email: email,
        newPassword: newPassword
      });
      toast.success("nouveau mot de passe enregistrée avec succés!");
      setShowCodeModal(false);
      setShowResetModal(false);

      setOtp("");
      setNewPassword("");

    }catch(error){
       console.log(error);
      toast.error(error.response?.data || "Code invalide");
    }

}

 
  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#f4f1ed,#e6dfd6)"
      }}>

      <div className="card border-0 shadow-lg"
        style={{width: "100%",maxWidth: "500px",borderRadius: "20px",padding: "30px"}}>
        <div className="card-body">
          <h2 className="text-center mb-4">
            {iscreateAccount ? "Sign up" : "Login"}
          </h2>

          {error && (
            <div className="alert alert-danger text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* LEFT COLUMN */}
              {iscreateAccount && (
                <div className="col-md-6">

                  <h6 className="text-muted mb-3">
                    Informations personnelles
                  </h6>
                  <label htmlFor="nom" className="form-label">Nom</label>
                  <input className="form-control mb-3"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                  <label htmlFor="prenom" className="form-label">Prénom</label>
                  <input className="form-control mb-3"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                  <label htmlFor="telephone" className="form-label">Numéro télephone</label>
                  <input className="form-control mb-3"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                  />
                  <label htmlFor="email" className="form-label">Email professionnel</label>
                  <input className="form-control mb-3"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                </div>
              )}

              {/* RIGHT COLUMN */}
              {iscreateAccount && (
                <div className="col-md-6">

                  <h6 className="text-muted mb-3">
                    Informations d'organisme
                  </h6>
                  <label htmlFor="organisme" className="form-label">Organisme</label>
                  <input className="form-control mb-3"
                    value={organisme}
                    onChange={(e) => setOrganisme(e.target.value)}
                    required
                  />
                  <label htmlFor="typeOrganisme" className="form-label">Type d'organisme</label>
                  <select className="form-control mb-3"
                    value={typeOrganisme}
                    onChange={(e) => setTypeOrganisme(e.target.value)}
                    required
                  >
                    <option value=""></option>
                    <option value="publique">Publique</option>
                    <option value="prive">Privé</option>
                    <option value="societe civile">Société civile</option>
                  </select>
                  <label htmlFor="role" className="form-label">Role dans l'organisme</label>
                  <input className="form-control mb-3"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />

                </div>
              )}

            </div>

            {/* PASSWORD LOGIN */}
            {!iscreateAccount && (
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
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? "Chargement..."
                : iscreateAccount
                  ? "S'inscrire"
                  : "Se connecter"}
            </button>

          </form>

          {/* SWITCH MODE */}
          <div className="text-center mt-4 small text-muted">

            {iscreateAccount ? (
              <>
                Vous avez déjà un compte ?
                <span className="text-primary ms-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsCreateAccount(false)}>
                  Sign in
                </span>
              </>
            ) : (
              <>
              <div className="d-flex flex-column mt-4 small text-muted gap-2">
                <div>
                Vous n'avez pas de compte ?
                <span className="text-primary ms-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsCreateAccount(true)}>
                  Sign up
                </span>
                </div>

                <div>
                oubliez mot de passe ?
                <span className="text-primary ms-1"
                  style={{ cursor: "pointer" }}
                  onClick={handleForgotPassword}

                  >
                  clicker ici
                </span>
                </div>
              </div>
              </>
            )}

          </div>
          {showCodeModal && (
  <div className="modal show d-block"
    style={{ background: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content p-4">

        <h5 className="mb-3 text-center">
          Entrer le code d'inscription
        </h5>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Code d'inscription"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCodeModal(false)}
          >
            Annuler
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {verifyOtp()}}
          >
            Valider
          </button>
        </div>

      </div>
    </div>
  </div>
)}
  {showResetModal && (
  <div className="modal show d-block"
    style={{ background: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content p-4">

        <h5 className="mb-3 text-center">
          Réinitialiser le mot de passe
        </h5>

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <div className="d-flex justify-content-end gap-2">

          <button
            className="btn btn-secondary"
            onClick={() => setShowResetModal(false)}
          >
            Annuler
          </button>

          <button
            className="btn btn-primary"
            onClick={handleResetPassword}
          >
            Valider
          </button>

        </div>

      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
    
  );
};

export default Login;