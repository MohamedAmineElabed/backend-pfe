import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';

const Login = () => {
  const [iscreateAccount, setIsCreateAccount] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [typeOrganisme, setTypeOrganisme] = useState('');
  const [role, setRole] = useState('');
  const [telephone, setTelephone] = useState('');
  const [description, setDescription] = useState('');
  const[adresse,setAdresse]=useState('');
  const[fax,setFax]=useState('');
  const[emailOrganisme,setEmailOrganisme]=useState('');
  const[secteur,setSecteur]=useState('');
  const[dateCreation,setDateCreation]=useState('');




  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { backendUrl, setIsloggedIn, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  

  const phoneRegex = /^[0-9]+$/;

  // ---------- LOGIN / SIGNUP ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (iscreateAccount) {
        const response = await axios.post(`${backendUrl}/demandes/registerDemande`, {
          nom, prenom, email, nomOrganisme:organisme, typeOrganisme, role, telephone, description,adresse,secteur,fax,dateCreation,emailOrganisme
        });

        if (response.status === 201) {
          setUserData(response.data);
          setIsloggedIn(true);
          toast.success("Inscription réussie !");
        }
      } else {
        const response = await axios.post(`${backendUrl}/login`, { email, password });

        if (response.status === 200) {
          const loggedInUser = response.data;  //pour déterminer le role de user
          setUserData(response.data);
          localStorage.setItem("userData", JSON.stringify(response.data));
          setIsloggedIn(true);
          if (loggedInUser.role === "ADMIN") {
            navigate('/homePageAdmin');
          } else {
            navigate('/homePage');
      }

          toast.success("Connexion réussie !");
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD ----------
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Veuillez saisir votre email");
      return;
    }
    setShowCodeModal(true);
    setSendingOtp(true);

    try {
      await axios.post(`${backendUrl}/email/send-reset-otp`, { email });
      toast.success("Votre code a été envoyé par email !");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Email n'existe pas");
      setShowCodeModal(false);
    } finally {
      setSendingOtp(false);
    }
  };

  // ---------- VERIFY OTP ----------
  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Veuillez saisir le code OTP");
      return;
    }
    try {
      await axios.post(`${backendUrl}/verify-otp`, { email, otp });
      toast.success("OTP validé !");
      setShowCodeModal(false);
      setShowResetModal(true);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Code invalide ou expiré");
    }
  };

  // ---------- RESET PASSWORD ----------
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Veuillez saisir le nouveau mot de passe");
      return;
    }
    try {
      await axios.post(`${backendUrl}/reset-password`, { email, newPassword });
      toast.success("Nouveau mot de passe enregistré avec succès !");
      setShowResetModal(false);
      setOtp('');
      setNewPassword('');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Mot de pase faible");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
         style={{ height: "100vh", background: "linear-gradient(135deg,#f4f1ed,#e6dfd6)" }}>
      <div className="card border-0 shadow-lg"
           style={{ width: "100%", maxWidth: "500px", borderRadius: "20px", padding: "30px" }}>
        <div className="card-body">
          <h2 className="text-center mb-4">{iscreateAccount ? "Enregistrer demande" : "Login"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {iscreateAccount && (
                <>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">Informations personnelles</h6>
                    <input className="form-control mb-3" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required />
                    <input className="form-control mb-3" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} required />
                    <input className="form-control mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="form-control mb-3" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} required />
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">Informations d'organisme</h6>
                    <input className="form-control mb-3" placeholder="Nom d'organisme" value={organisme} onChange={e => setOrganisme(e.target.value)} required />
                    <select className="form-control mb-3" value={typeOrganisme} onChange={e => setTypeOrganisme(e.target.value)} required>
                      <option value="">Type d'organisme</option>
                      <option value="publique">Publique</option>
                      <option value="prive">Privé</option>
                      <option value="societe civile">Société civile</option>
                    </select>
                    <input className="form-control mb-3" placeholder="Téléphone" value={telephone}
                    onChange={e => {const value = e.target.value;
                      // Allow only digits and max 8 characters
                      if (/^\d{0,8}$/.test(value)) {setTelephone(value);}
                    }} required />
                    <input className="form-control mb-3" placeholder="Adresse" 
                    value={adresse} onChange={e => setAdresse(e.target.value)} required />

                    <input className="form-control mb-3" placeholder="N° fax" 
                    value={fax} onChange={e => setFax(e.target.value)} required />

                    <input className="form-control mb-3" placeholder="Email de l'organisme" type="email"
                    value={emailOrganisme} onChange={e => setEmailOrganisme(e.target.value)} required />

                    <input className="form-control mb-3" placeholder="Secteur d'activité" 
                    value={secteur} onChange={e => setSecteur(e.target.value)} required />

                    <input className="form-control mb-3" placeholder="Date création" type="date"
                    value={dateCreation} onChange={e => setDateCreation(e.target.value)} required />


                    
                  </div>
                  {/*<textarea
                      className="form-control mb-3"
                      placeholder="Description de la demande"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      required
                    />*/}
                </>
              )}
            </div>

            {!iscreateAccount && (
              <div className="mb-4">
                <input className="form-control mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input className="form-control" type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Chargement..." : iscreateAccount ? "S'inscrire" : "Se connecter"}
            </button>
          </form>

          {/* SWITCH MODE */}
          <div className="text-center mt-4 small text-muted">
            {iscreateAccount ? (
              <>
                Vous avez déjà un compte ?
                <span className="text-primary ms-1" style={{ cursor: "pointer" }} onClick={() => setIsCreateAccount(false)}>Sign in</span>
              </>
            ) : (
              <div className="d-flex flex-column mt-4 small text-muted gap-2">
                <div>
                  Vous n'avez pas de compte ?
                  <span className="text-primary ms-1" style={{ cursor: "pointer" }} onClick={() => setIsCreateAccount(true)}>Enregistrer demande</span>
                </div>
                <div>
                  Mot de passe oublié ?
                  <span className="text-primary ms-1" style={{ cursor: "pointer" }} onClick={handleForgotPassword}>Cliquez ici</span>
                </div>
              </div>
            )}
          </div>

          {/* OTP MODAL */}
          {showCodeModal && (
            <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-4">
                  <h5 className="mb-3 text-center">Entrer le code OTP</h5>
                  {sendingOtp ? (
                    <p className="text-center">Envoi du code en cours...</p>
                  ) : (
                    <>
                      <input type="text" className="form-control mb-3" placeholder="Code OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary" onClick={() => setShowCodeModal(false)}>Annuler</button>
                        <button className="btn btn-primary" onClick={verifyOtp}>Valider</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RESET PASSWORD MODAL */}
          {showResetModal && (
            <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-4">
                  <h5 className="mb-3 text-center">Réinitialiser le mot de passe</h5>
                  <input type="password" className="form-control mb-3" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <small className="text-muted d-block mb-3">
                    Le mot de passe doit contenir :
                    <ul className="mb-0 ms-3">
                      <li>Au moins 8 caractères</li>
                      <li>Au moins une lettre majuscule</li>
                      <li>Au moins une lettre minuscule</li>
                      <li>Au moins un chiffre</li>
                      <li>Au moins un caractère spécial</li>
                    </ul>
                  </small>
                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Annuler</button>
                    <button className="btn btn-primary" onClick={handleResetPassword}>Valider</button>
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