import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const VerifyAccount = () => {
  const { backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search); // get query params from URL
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setUserData(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem('token'); //clear any existing token on this page to prevent confusion
  }, []);

  useEffect(() => {
    if (!email) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`${backendUrl}/check-email`, { params: { email } }, { withCredentials: true });
        if (res.data.exists) {
          toast.error("Un compte avec cet email existe déjà !");
          setEmailExists(true);
        }
      } catch (e) {
        console.log("Erreur check email", e);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Email invalide !"); return; }
    if (password !== confirmPassword) { toast.error("Les mots de passe ne correspondent pas !"); return; }
    try {
      setLoading(true);
      const cleanEmail = email.trim();
      await axios.post(`${backendUrl}/register-from-demande/${encodeURIComponent(cleanEmail)}`, { password }, { withCredentials: true });
      toast.success("Votre compte a été créé avec succès !");
      window.location.href = "/Login";
    } catch (error) {
      let message = error.response?.data || "Erreur serveur";
      if (typeof message === "object") message = Object.values(message)[0];
      if (message.toLowerCase().includes("already exists")) toast.error("Un compte avec cet email existe déjà !");
      else if (message.toLowerCase().includes("faible") || message.toLowerCase().includes("weak")) toast.error("Mot de passe faible");
      else toast.error(message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles (identical to Login) ──────────────────────────
  const inputStyle = {
    width: "100%", padding: "10px 40px 10px 14px",
    fontSize: 13, border: "1px solid #e2e8f0",
    borderRadius: 10, outline: "none",
    background: "#f8fafc", color: "#1e293b",
    fontFamily: "inherit", transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 4, display: "block",
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#0f2044 0%,#1e3a5f 50%,#2d5282 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}>

          {/* ── Header ── */}
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
                CRÉATION DE COMPTE
              </div>
            </div>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding: "28px 32px" }}>
            <form onSubmit={handleSubmit} className="form-section">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="login-input" style={inputStyle}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={emailExists} required
                    />
                    <span onClick={() => setShowPassword(p => !p)} style={{
                      position: "absolute", right: 10, top: "50%",
                      transform: "translateY(-50%)", cursor: "pointer",
                      fontSize: 13, color: "#3b82f6",
                    }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>Confirmer le mot de passe</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="login-input" style={inputStyle}
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={emailExists} required
                    />
                    <span onClick={() => setShowConfirm(p => !p)} style={{
                      position: "absolute", right: 10, top: "50%",
                      transform: "translateY(-50%)", cursor: "pointer",
                      fontSize: 13, color: "#3b82f6",
                    }}>
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                {/* Password hint */}
                <div style={{
                  background: "#f0f9ff", border: "1px solid #bae6fd",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: "#0369a1",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
                  }}>
                    Le mot de passe doit contenir :
                  </div>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {["Au moins 8 caractères", "Au moins une lettre majuscule",
                      "Au moins une lettre minuscule", "Au moins un chiffre",
                      "Au moins un caractère spécial"].map(r => (
                      <li key={r} style={{ fontSize: 12, color: "#0369a1", lineHeight: "1.8" }}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Submit */}
              {!emailExists ? (
                <button type="submit" className="login-btn" disabled={loading} style={{
                  width: "100%", marginTop: 24, padding: "13px",
                  background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em", transition: "all 0.2s", opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Chargement...</>
                    : "🔐 Terminer la création"
                  }
                </button>
              ) : (
                <button type="button" onClick={() => navigate("/login")} className="login-btn" style={{
                  width: "100%", marginTop: 24, padding: "13px",
                  background: "linear-gradient(135deg,#1e3a5f,#2d5282)",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 14, fontWeight: 800, cursor: "pointer",
                  letterSpacing: "0.04em", transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  ← Retourner à la connexion
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyAccount;