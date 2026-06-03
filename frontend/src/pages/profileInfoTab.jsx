import React, { useEffect, useState, useContext } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

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
  editBtn: {
    position: "absolute",
    top: "28px",
    right: "28px",
    padding: "7px 18px",
    fontSize: "0.8rem",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    background: "transparent",
    color: "#7C6A4A",
    border: "1.5px solid #C4AD88",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "sans-serif",
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
  input: (isEditing) => ({
    padding: "10px 14px",
    fontSize: "0.95rem",
    color: "#2C2416",
    background: isEditing ? "#FFFFFF" : "#F5F0E8",
    border: isEditing ? "1.5px solid #C4AD88" : "1.5px solid transparent",
    borderRadius: "9px",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "'Georgia', serif",
    width: "100%",
    boxSizing: "border-box",
  }),
  inputReadonly: {
    padding: "10px 14px",
    fontSize: "0.95rem",
    color: "#2C2416",
    background: "#F5F0E8",
    border: "1.5px solid transparent",
    borderRadius: "9px",
    fontFamily: "'Georgia', serif",
    width: "100%",
    boxSizing: "border-box",
    cursor: "default",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #E8E0D0",
  },
  cancelBtn: {
    padding: "9px 22px",
    fontSize: "0.82rem",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "transparent",
    color: "#9A876A",
    border: "1.5px solid #D4C8B4",
    borderRadius: "9px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "sans-serif",
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
};

const ProfileInfoTab = ({ user }) => {
  const { backendUrl } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    role: "",
    jobRole: ""
  });

  useEffect(() => {
    if (!user) return;
    console.log("USER:", user);
    setFormData({
      id: user.id || "",
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      role: user.role || "",
      jobRole: user.jobRole || ""
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!user) return;
    setFormData({
      id: user.id || "",
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      role: user.role || "",
      jobRole: user.jobRole || ""
    });
  };

  const handleSave = async () => {
    const onlyLetters = /^[A-Za-zÀ-ÿ\s]*$/;
    if(!onlyLetters.test(formData.nom)) {
      toast.error("Le nom ne doit contenir que des lettres !");
      return;
    }
    if(!onlyLetters.test(formData.prenom)) {
      toast.error("Le prénom ne doit contenir que des lettres !");
      return;
    }
    if(!onlyLetters.test(formData.jobRole)) {
      toast.error("Le rôle ne doit contenir que des lettres !");
      return;
    }
    if (
      !formData.nom.trim() ||
      !formData.prenom.trim() ||
      !formData.email.trim() ||
      !formData.role.trim()
    ) {
      toast.error("Tous les champs sont obligatoires !");
      return;
    }
    try {
      await axios.put(`${backendUrl}/users/update/${formData.id}`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });
      toast.success("Mise à jour réussie !");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error.response?.data || error);
    }
  };

  const isRoleReadonly = !isEditing || formData.role === "ADMIN" || formData.role === "EVALUATEUR";

  return (
    <div style={styles.card}>
      <h5 style={styles.title}>Informations</h5>

      {!isEditing && (
        <button
          style={{
            ...styles.editBtn,
            ...(hoveredBtn === "edit" ? { background: "#F5EFE2", color: "#5C4A2A" } : {})
          }}
          onMouseEnter={() => setHoveredBtn("edit")}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={() => setIsEditing(true)}
        >
          Modifier
        </button>
      )}

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            readOnly={!isEditing}
            onChange={handleChange}
            style={isEditing ? styles.input(true) : styles.inputReadonly}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            readOnly={!isEditing}
            onChange={handleChange}
            style={isEditing ? styles.input(true) : styles.inputReadonly}
          />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          readOnly={!isEditing}
          onChange={handleChange}
          style={isEditing ? styles.input(true) : styles.inputReadonly}
        />
      </div>

      <div style={styles.group}>
        {/*<label style={styles.label}>Rôle</label>*/}
        <label style={styles.label}>Poste</label>
        <input
          type="text"
          name={formData?.role === "RESPONSABLE" ? "jobRole" : "role"}
          value={formData?.role === "RESPONSABLE" ? formData?.jobRole : formData?.role}
          readOnly={isRoleReadonly}
          onChange={handleChange}
          style={!isRoleReadonly ? styles.input(true) : styles.inputReadonly}
        />
      </div>

      {isEditing && (
        <div style={styles.actions}>
          <button
            style={{
              ...styles.cancelBtn,
              ...(hoveredBtn === "cancel" ? { background: "#F5EFE2", color: "#5C4A2A" } : {})
            }}
            onMouseEnter={() => setHoveredBtn("cancel")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={handleCancel}
          >
            Annuler
          </button>
          <button
            style={{
              ...styles.saveBtn,
              ...(hoveredBtn === "save" ? { background: "#4A6A42", transform: "translateY(-1px)" } : {})
            }}
            onMouseEnter={() => setHoveredBtn("save")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={handleSave}
          >
            Enregistrer
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoTab;