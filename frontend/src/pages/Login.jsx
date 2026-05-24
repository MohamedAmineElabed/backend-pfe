import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [iscreateAccount, setIsCreateAccount] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [typeOrganisme, setTypeOrganisme] = useState('');
  const [role, setRole] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [telephone, setTelephone] = useState('');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [fax, setFax] = useState('');
  const [emailOrganisme, setEmailOrganisme] = useState('');
  const [secteur, setSecteur] = useState('');
  const [dateCreation, setDateCreation] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { backendUrl, setIsLoggedIn, setUserData, loadUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (iscreateAccount) {
        if (telephone.length !== 8) { toast.error("Le téléphone doit contenir exactement 8 chiffres"); setLoading(false); return; }
        if (fax.length !== 8) { toast.error("Le fax doit contenir exactement 8 chiffres"); setLoading(false); return; }
        const formData = new FormData();
        formData.append("nom", nom); formData.append("prenom", prenom);
        formData.append("email", email); formData.append("nomOrganisme", organisme);formData.append("role","RESPONSABLE");
        formData.append("typeOrganisme", typeOrganisme); formData.append("jobRole", jobRole);
        formData.append("telephone", telephone); //formData.append("description", description);
        formData.append("adresse", adresse); formData.append("secteur", secteur);
        formData.append("fax", fax); formData.append("dateCreation", dateCreation);
        formData.append("emailOrganisme", emailOrganisme);
        if (logoFile) formData.append("logo", logoFile);
        const response = await axios.post(`${backendUrl}/demandes/registerDemande`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true 
        });
        if (response.status === 201) {
          //setUserData(response.data); 
          //setIsLoggedIn(true);
          //sessionStorage.setItem("userData", JSON.stringify(response.data));
          toast.success("Demande enregistrée avec succès ! Attendez la validation de l'admin.");
          setIsCreateAccount(false);
        }
      } else {
        const response = await axios.post(`${backendUrl}/login`, { email, password },{ withCredentials: true });
        if (response.status === 200) {
          //save token from header
          const token = response.headers['x-auth-token'];
          console.log("TOKEN RECEIVED:", token);
          if (token) sessionStorage.setItem('token', token);

          const loggedInUser = response.data;
          setUserData(response.data);
          //sessionStorage.setItem("userData", JSON.stringify(response.data));
          await loadUser(); // Ensure user data is loaded before navigating
          setIsLoggedIn(true);
          //sessionStorage.setItem("userData", JSON.stringify(response.data));
          if (loggedInUser.role === "ADMIN") navigate('/dashboardsAdmin');
          else if (loggedInUser.role === "EVALUATEUR") navigate('/dashboardsEval');
          else navigate('/dashboardsResp');
          toast.success("Connexion réussie !");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { toast.error("Veuillez saisir votre email"); return; }
    setShowCodeModal(true); setSendingOtp(true);
    try {
      await axios.post(`${backendUrl}/email/send-reset-otp`, { email },{ withCredentials: true });
      toast.success("Code envoyé par email !");
    } catch (error) {
      toast.error(error.response?.data?.message || "Email introuvable");
      setShowCodeModal(false);
    } finally { setSendingOtp(false); }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) { toast.error("Veuillez saisir le code OTP"); return; }
    try {
      await axios.post(`${backendUrl}/verify-otp`, { email, otp },{ withCredentials: true });
      toast.success("OTP validé !");
      setShowCodeModal(false); setShowResetModal(true);
    } catch (error) { toast.error(error.response?.data?.message || "Code invalide ou expiré"); }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) { toast.error("Veuillez saisir le nouveau mot de passe"); return; }
    try {
      await axios.post(`${backendUrl}/reset-password`, { email, newPassword },{ withCredentials: true });
      toast.success("Mot de passe réinitialisé !");
      setShowResetModal(false); setOtp(''); setNewPassword('');
    } catch (error) { toast.error(error.response?.data?.message || "Mot de passe faible"); }
  };

  // ── Shared input style ──────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "10px 14px",
    fontSize: 13, border: "1px solid #e2e8f0",
    borderRadius: 10, outline: "none",
    background: "#f8fafc", color: "#1e293b",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 4, display: "block",
  };
  const sectionTitle = {
    fontSize: 12, fontWeight: 800, color: "#fff",
    textTransform: "uppercase", letterSpacing: "0.08em",
    background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
    padding: "8px 14px", borderRadius: 8, marginBottom: 14,
    display: "flex", alignItems: "center", gap: 8,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .login-input:focus { border-color: #3b82f6 !important; background: #fff !important; }
        .login-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); }
        .switch-link:hover { text-decoration: underline; }
        .form-section { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Page background ── */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#0f2044 0%,#1e3a5f 50%,#2d5282 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Card ── */}
        <div style={{
          width: "100%", maxWidth: iscreateAccount ? 780 : 420,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          overflow: "hidden",
          transition: "max-width 0.4s ease",
        }}>

          {/* ── Card header ── */}
          <div style={{
            background: "linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%)",
            padding: "28px 32px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, flexShrink: 0,
            }}>🏛</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                Portail de bonne Gouvernance
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", marginTop: 2 }}>
                {iscreateAccount ? "ENREGISTREMENT D'UNE DEMANDE" : "ESPACE AUTHENTIFICATION"}
              </div>
            </div>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding: "28px 32px" }}>
            <form onSubmit={handleSubmit}>

              {/* ── REGISTER FORM ── */}
              {iscreateAccount && (
                <div className="form-section">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

                    {/* Left column — personal info */}
                    <div>
                      <div style={sectionTitle}>
                        <span>👤</span> Informations personnelles
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          //{ label: "Nom", value: nom, set: setNom, type: "text" },
                          { label: "Nom", value: nom, set: (value) => {
                            if (/^[A-Za-zÀ-ÿ\s]*$/.test(value)) {  // Autoriser uniquement les lettres et les espaces
                              setNom(value);
                            }
                          }, type: "text" },
                          { label: "Prénom", value: prenom, set: (value) => {
                            if (/^[A-Za-zÀ-ÿ\s]*$/.test(value)) { 
                              setPrenom(value);
                            }
                          }, type: "text" },
                          { label: "Email personnel", value: email, set: setEmail, type: "email" },
                          { label: "Rôle dans l'organisme", value: jobRole, set: (value) => {
                            if (/^[A-Za-zÀ-ÿ\s]*$/.test(value)) { 
                              setJobRole(value);
                            }
                          }, type: "text" },
                        ].map(f => (
                          <div key={f.label}>
                            <label style={labelStyle}>{f.label}</label>
                            <input
                              className="login-input"
                              style={inputStyle} type={f.type}
                              placeholder={f.label} value={f.value}
                              onChange={e => f.set(e.target.value)} required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column — organisme info */}
                    <div>
                      <div style={sectionTitle}>
                        <span>🏢</span> Informations de l'organisme
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                        <div>
                          <label style={labelStyle}>Nom de l'organisme</label>
                          <input className="login-input" style={inputStyle} placeholder="Nom de l'organisme"
                            value={organisme} onChange={e =>{
                              if (/^[A-Za-zÀ-ÿ\s]*$/.test(e.target.value)) {
                                setOrganisme(e.target.value);
                              }
                            }
                            //setOrganisme(e.target.value)
                            } required />
                        </div>

                        <div>
                          <label style={labelStyle}>Type d'organisme</label>
                          <select className="login-input" style={{ ...inputStyle, cursor: "pointer" }}
                            value={typeOrganisme} onChange={e => setTypeOrganisme(e.target.value)} required>
                            <option value="">Sélectionner...</option>
                            <option value="publique">Publique</option>
                            <option value="prive">Privé</option>
                            <option value="societe civile">Société civile</option>
                          </select>
                        </div>

                        {[
                          { label: "Téléphone (8 chiffres)", value: telephone, set: v => /^\d{0,8}$/.test(v) && setTelephone(v) },
                          { label: "Adresse", value: adresse, set: setAdresse },
                          { label: "N° Fax (8 chiffres)", value: fax, set: v => /^\d{0,8}$/.test(v) && setFax(v) },
                          { label: "Email de l'organisme", value: emailOrganisme, set: setEmailOrganisme, type: "email" },
                          { label: "Secteur d'activité", value: secteur, set: (value) => {
                            if (/^[A-Za-zÀ-ÿ\s]*$/.test(value)) { 
                              setSecteur(value);
                            }
                          } },
                        ].map(f => (
                          <div key={f.label}>
                            <label style={labelStyle}>{f.label}</label>
                            <input className="login-input" style={inputStyle}
                              placeholder={f.label} value={f.value} type={f.type || "text"}
                              onChange={e => f.set(e.target.value)} required />
                          </div>
                        ))}

                        <div>
                          <label style={labelStyle}>Date de création</label>
                          <input className="login-input" style={inputStyle} type="date"
                            value={dateCreation} onChange={e => setDateCreation(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo upload — full width */}
                  <div style={{ marginTop: 20 }}>
                    <label style={labelStyle}>Logo de l'organisme</label>
                    <div style={{
                      border: "2px dashed #cbd5e1", borderRadius: 12,
                      padding: "16px 20px", background: "#f8fafc",
                      display: "flex", alignItems: "center", gap: 12,
                      cursor: "pointer",
                    }}
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      <span style={{ fontSize: 24 }}>🖼</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                          {logoFile ? logoFile.name : "Cliquez pour sélectionner un logo"}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                          PNG, JPG, SVG acceptés
                        </div>
                      </div>
                      <input id="logo-upload" type="file" accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => setLogoFile(e.target.files[0])} required />
                    </div>
                  </div>
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {!iscreateAccount && (
                <div className="form-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Adresse email</label>
                    <input className="login-input" style={inputStyle} type="email"
                      placeholder="votre@email.com" value={email}
                      onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Mot de passe</label>
                    <div style={{ position: "relative" }}>
                    <input className="login-input" style={inputStyle} type={showPassword ? "text" : "password"}
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)} required />
                    <span
                        onClick={() => setShowPassword(prev => !prev)}
                        style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#3b82f6",
                        fontWeight: 600
                        }}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="switch-link" onClick={handleForgotPassword} style={{
                      fontSize: 12, color: "#3b82f6", cursor: "pointer", fontWeight: 600,
                    }}>
                      Mot de passe oublié ?
                    </span>
                  </div>
                </div>
              )}

              {/* ── Submit button ── */}
              <button type="submit" className="login-btn" disabled={loading} style={{
                width: "100%", marginTop: 24, padding: "13px",
                background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", transition: "all 0.2s",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Chargement...</>
                  : iscreateAccount ? "📋 Soumettre la demande" : "🔐 Se connecter"
                }
              </button>
            </form>

            {/* ── Switch mode ── */}
            <div style={{
              marginTop: 20, textAlign: "center",
              fontSize: 13, color: "#64748b",
              borderTop: "1px solid #f1f5f9", paddingTop: 16,
            }}>
              {iscreateAccount ? (
                <>Vous avez déjà un compte ?{" "}
                  <span className="switch-link" onClick={() => setIsCreateAccount(false)}
                    style={{ color: "#3b82f6", fontWeight: 700, cursor: "pointer" }}>
                    Se connecter
                  </span>
                </>
              ) : (
                <>Vous n'avez pas de compte ?{" "}
                  <span className="switch-link" onClick={() => setIsCreateAccount(true)}
                    style={{ color: "#3b82f6", fontWeight: 700, cursor: "pointer" }}>
                    Enregistrer une demande
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {showCodeModal && (
        <Modal title="Vérification OTP" icon="📧" onClose={() => setShowCodeModal(false)}>
          {sendingOtp ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
              Envoi du code en cours...
            </div>
          ) : (
            <>
              <label style={labelStyle}>Code OTP reçu par email</label>
              <input className="login-input" style={{ ...inputStyle, marginBottom: 20 }}
                placeholder="Entrez le code" value={otp} onChange={e => setOtp(e.target.value)} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowCodeModal(false)} style={cancelBtnStyle}>Annuler</button>
                <button onClick={verifyOtp} style={confirmBtnStyle}>Valider</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Reset Password Modal ── */}
      {showResetModal && (
        <Modal title="Nouveau mot de passe" icon="🔒" onClose={() => setShowResetModal(false)}>
          <label style={labelStyle}>Nouveau mot de passe</label>
          <input className="login-input" style={{ ...inputStyle, marginBottom: 12 }}
            type="password" placeholder="Nouveau mot de passe"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#166534",
          }}>
            Minimum 8 caractères · Majuscule · Minuscule · Chiffre · Caractère spécial
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowResetModal(false)} style={cancelBtnStyle}>Annuler</button>
            <button onClick={handleResetPassword} style={confirmBtnStyle}>Confirmer</button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

// ── Reusable Modal component ──────────────────────────────────────
function Modal({ title, icon, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,32,68,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)", overflow: "hidden",
      }}>
        <div style={{
          background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
          padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{title}</span>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: 28, height: 28, borderRadius: "50%",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
          }}>✕</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

const cancelBtnStyle = {
  flex: 1, padding: "10px", border: "1px solid #e2e8f0",
  borderRadius: 10, background: "#f8fafc", color: "#64748b",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const confirmBtnStyle = {
  flex: 1, padding: "10px",
  background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
  border: "none", borderRadius: 10, color: "#fff",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
};

export default Login;