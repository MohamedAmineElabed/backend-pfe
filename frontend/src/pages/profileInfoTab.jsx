import React, { useEffect, useState, useContext } from 'react';
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

const ProfileInfoTab = ({ user }) => {
  const { backendUrl } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    role: ""
  });

  // Initialisation des données utilisateur
  useEffect(() => {
    if (!user) return;

    console.log("USER:", user); // pour vérifier si organisme est présent

    setFormData({
      id: user.id || "",
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      role: user.role || ""
    });
  }, [user]);

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "organisme") {
      setFormData({
        ...formData,});
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setIsEditing(false);
    if (!user) return;

    setFormData({
      id: user.id || "",
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      role: user.role || ""
    });
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      /*const payload = {...formData,
        // On envoie uniquement l'ID de l'organisme
        //organisme: formData.organisme ? { id: formData.organisme.id } : null
      };*/

      await axios.put(`${backendUrl}/users/update/${formData.id}`, formData,{
    headers: {
      "Content-Type": "application/json"
    }
  });

      toast.success("Mise à jour réussie !");
      setIsEditing(false);

    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error.response?.data || error);
    }
  };

  return (
    <Card
      className="p-4 border-0 shadow-sm"
      style={{ background: "#faf9f6", border: "1px solid #dbd8d0", borderRadius: 14, padding: 24 }}
    >
      <h5 className="mb-4">Informations</h5>

      {!isEditing && (
        <Button
          size="sm"
          className="position-absolute top-0 end-0 m-3"
          onClick={() => setIsEditing(true)}
        >
          Modifier
        </Button>
      )}

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                name="prenom"
                value={formData.prenom}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            readOnly={!isEditing}
            onChange={handleChange}
          />
        </Form.Group>

        

        <Form.Group className="mb-3">
          <Form.Label>Rôle</Form.Label>
          <Form.Control
            type="text"
            name="role"
            value={formData.role}
            readOnly={!isEditing || formData.role === "ADMIN"}
            onChange={handleChange}
          />
        </Form.Group>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleCancel}>
              Annuler
            </Button>

            <Button variant="success" onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
};

export default ProfileInfoTab;