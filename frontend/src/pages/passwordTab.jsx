import React, { useState, useEffect, useContext } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from '../context/AppContext.jsx';

const styles = {
  card: {
    background: "#FFFCF7",
    border: "1px solid #E8E0D0",
    borderRadius: "16px",
    padding: "32px",
    position: "relative",
    boxShadow: "0 2px 16px rgba(80, 60, 30, 0.07)",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  title: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#2C2416",
    marginBottom: "28px",
    letterSpacing: "0.02em",
    fontFamily: "'Georgia', serif",
    borderBottom: "2px solid #E8E0D0",
    paddingBottom: "14px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 20px",
  },
  group: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.72rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#9A876A",
    marginBottom: "7px",
    fontFamily: "sans-serif",
  },
  input: {
    padding: "10px 14px",
    fontSize: "0.95rem",
    color: "#2C2416",
    background: "#FFFFFF",
    border: "1.5px solid #C4AD88",
    borderRadius: "9px",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "'Georgia', serif",
    width: "100%",
    boxSizing: "border-box",
  },
  hintBox: {
    background: "#F5F0E8",
    border: "1px solid #E8E0D0",
    borderRadius: "10px",
    padding: "14px 18px",
    marginTop: "4px",
    marginBottom: "8px",
  },
  hintTitle: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#9A876A",
    marginBottom: "8px",
    fontFamily: "sans-serif",
  },
  hintList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  hintItem: {
    fontSize: "0.82rem",
    color: "#7C6A4A",
    fontFamily: "sans-serif",
    paddingLeft: "16px",
    position: "relative",
    lineHeight: "1.8",
  },
  hintDot: {
    position: "absolute",
    left: "4px",
    top: "0",
    color: "#C4AD88",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #E8E0D0",
  },
  saveBtn: {
    padding: "9px 22px",
    fontSize: "0.82rem",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "#5A7A52",
    color: "#FFFFFF",
    border: "1.5px solid transparent",
    borderRadius: "9px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "sans-serif",
  },
  cancelBtn: {
    padding: "9px 22px",
    fontSize: "0.82rem",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "#5A7A52",
    color: "#FFFFFF",
    border: "1.5px solid transparent",
    borderRadius: "9px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "sans-serif",
  }
};

const hints = [
  "Au moins 8 caractères",
  "Au moins une lettre majuscule",
  "Au moins une lettre minuscule",
  "Au moins un chiffre",
  "Au moins un caractère spécial",
];

const PasswordTab = ({ user }) => {
  const [isEditing] = useState(true);
  const { backendUrl } = useContext(AppContext);
  const [hoveredSave, setHoveredSave] = useState(false);
  const [hoveredCancel, setHoveredCancel] = useState(false); 

  const [passwordData, setPasswordData] = useState({
    userId: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user?.id) {
      setPasswordData(prev => ({ ...prev, userId: user.id }));
    }
  }, [user]);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setPasswordData({ userId: user.id, oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handlesave = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("tous les champs doivent être remplis");
      return;
    }
    if(user.password !== passwordData.oldPassword) {
      toast.error("le mot de passe actuel est incorrect!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("les mots de passe ne correspondent pas!");
      return;
    }
    const requestBody = {
      userId: passwordData.userId,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    };
    try {
      await axios.put(`${backendUrl}/users/update-password`, requestBody, { withCredentials: true });
      toast.success("mise à jour avec succès!");
      setPasswordData({ userId: user.id, oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("faible mot de passe");
      console.log(error);
    }
  };

  return (
    <div style={styles.card}>
      <h5 style={styles.title}>Mot de Passe</h5>

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>Mot de passe Actuel</label>
          <input
            type="password"
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={handleChange}
            placeholder="••••••"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Nouveau Mot de passe</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            placeholder="••••••"
            required
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Confirmer Mot de passe</label>
        <input
          type="password"
          name="confirmPassword"
          value={passwordData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.hintBox}>
        <p style={styles.hintTitle}>Le mot de passe doit contenir :</p>
        <ul style={styles.hintList}>
          {hints.map((hint, i) => (
            <li key={i} style={styles.hintItem}>
              <span style={styles.hintDot}>·</span>
              {hint}
            </li>
          ))}
        </ul>
      </div>

      {isEditing && (
        <div style={styles.actions}>
          <button
            style={{
              ...styles.saveBtn,
              ...(hoveredSave ? { background: "#4A6A42", transform: "translateY(-2.5px)" } : {})
            }}
            onMouseEnter={() => setHoveredSave(true)}
            onMouseLeave={() => setHoveredSave(false)}
            onClick={handlesave}
          >
            Enregistrer
          </button>
          <button
            style={{
              ...styles.cancelBtn,
              ...(hoveredCancel? { background: "#4A6A42", transform: "translateY(-2.5px)" } : {})
            }}
            onMouseEnter={() => setHoveredCancel(true)}
            onMouseLeave={() => setHoveredCancel(false)}
            onClick={handleCancel}
          >
            Annuler
          </button> 
        </div>
      )}
    </div>
  );
};

export default PasswordTab;