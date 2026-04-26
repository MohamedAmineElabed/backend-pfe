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
  inputEditing: {
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
  fileInput: (isEditing) => ({
    padding: "8px 12px",
    fontSize: "0.85rem",
    color: "#7C6A4A",
    background: isEditing ? "#FFFFFF" : "#F5F0E8",
    border: isEditing ? "1.5px solid #C4AD88" : "1.5px dashed #D4C8B4",
    borderRadius: "9px",
    fontFamily: "sans-serif",
    width: "100%",
    boxSizing: "border-box",
    cursor: isEditing ? "pointer" : "not-allowed",
    opacity: isEditing ? 1 : 0.6,
  }),
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

const OrganismeInfoTab = ({ org }) => {
  const { backendUrl } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    nomOrganisme: "",
    type: "",
    emailOrganisme: "",
    telephone: "",
    adresse: "",
    fax: "",
    secteur: "",
    dateCreation: "",
  });

  useEffect(() => {
    if (!org) return;
    console.log("organisme:", org);
    setFormData({
      id: org.id || "",
      nomOrganisme: org.nomOrganisme || "",
      type: org.type || "",
      emailOrganisme: org.emailOrganisme || "",
      telephone: org.telephone || "",
      adresse: org.adresse || "",
      fax: org.fax || "",
      secteur: org.secteur || "",
      dateCreation: org.dateCreation || ""
    });
  }, [org]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!org) return;
    setFormData({
      id: org.id || "",
      nomOrganisme: org.nomOrganisme || "",
      type: org.type || "",
      emailOrganisme: org.emailOrganisme || "",
      telephone: org.telephone || "",
      adresse: org.adresse || "",
      fax: org.fax || "",
      secteur: org.secteur || "",
      dateCreation: org.dateCreation || ""
    });
  };

  const handleSave = async () => {
    if (
      !formData.nomOrganisme.trim() ||
      !formData.telephone.trim() ||
      !formData.emailOrganisme.trim() ||
      !formData.type.trim() ||
      !formData.fax.trim() ||
      !formData.secteur.trim() ||
      !formData.adresse.trim() ||
      !formData.dateCreation
    ) {
      toast.error("Tous les champs sont obligatoires !");
      return;
    }
    try {
      const formPayload = new FormData();
      formPayload.append("nomOrganisme", formData.nomOrganisme);
      formPayload.append("type", formData.type);
      formPayload.append("emailOrganisme", formData.emailOrganisme);
      formPayload.append("telephone", formData.telephone);
      formPayload.append("adresse", formData.adresse);
      formPayload.append("fax", formData.fax);
      formPayload.append("secteur", formData.secteur);
      formPayload.append("dateCreation", formData.dateCreation);
      if (formData.logo) {
        formPayload.append("logo", formData.logo);
      }
      await axios.put(
        `${backendUrl}/organismes/update/${formData.id}`,
        formPayload,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      toast.success("Organisme modifié avec succès");
      setIsEditing(false);
    } catch (error) {
      toast.error("erreur");
      console.error(error.response?.data || error);
    }
  };

  return (
    <div style={styles.card}>
      <h5 style={styles.title}>Informations sur l'Organisme</h5>

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
            name="nomOrganisme"
            value={formData.nomOrganisme}
            readOnly={!isEditing}
            onChange={handleChange}
            required
            style={isEditing ? styles.inputEditing : styles.inputReadonly}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            readOnly={!isEditing}
            onChange={handleChange}
            required
            style={isEditing ? styles.inputEditing : styles.inputReadonly}
          />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Logo</label>
        <input
          type="file"
          name="logo"
          accept="image/*"
          disabled={!isEditing}
          onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })}
          style={styles.fileInput(isEditing)}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Email</label>
        <input
          type="email"
          name="emailOrganisme"
          value={formData.emailOrganisme}
          readOnly={!isEditing}
          onChange={handleChange}
          required
          style={isEditing ? styles.inputEditing : styles.inputReadonly}
        />
      </div>

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>N° Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            readOnly={!isEditing}
            onChange={handleChange}
            required
            style={isEditing ? styles.inputEditing : styles.inputReadonly}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>N° Fax</label>
          <input
            type="text"
            name="fax"
            value={formData.fax}
            readOnly={!isEditing}
            onChange={handleChange}
            required
            style={isEditing ? styles.inputEditing : styles.inputReadonly}
          />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Adresse</label>
        <input
          type="text"
          name="adresse"
          value={formData.adresse}
          readOnly={!isEditing}
          onChange={handleChange}
          required
          style={isEditing ? styles.inputEditing : styles.inputReadonly}
        />
      </div>

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>Secteur</label>
          <input
            type="text"
            name="secteur"
            value={formData.secteur}
            readOnly={!isEditing}
            onChange={handleChange}
            required
            style={isEditing ? styles.inputEditing : styles.inputReadonly}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Date Création</label>
          <input
            type="date"
            name="dateCreation"
            value={formData.dateCreation}
            readOnly={!isEditing}
            onChange={handleChange}
            required
            style={isEditing ? styles.inputEditing : styles.inputReadonly}
          />
        </div>
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

export default OrganismeInfoTab;