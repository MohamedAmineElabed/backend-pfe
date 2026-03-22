import React, { useEffect, useState, useContext } from 'react';
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

const OrganismeInfoTab = ({ org }) => {
  const { backendUrl } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);

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

    //organisme: null, // objet organisme ou null
    //role: ""
  });

  // Initialisation des données utilisateur
  useEffect(() => {
    if (!org) return;

    console.log("organisme:", org); // pour vérifier si organisme est présent

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

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData,[name]: value});
    };


  // Annuler les modifications
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

  // Sauvegarder les modifications
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
    //const payload = { ...selectedOrganisme };
    // Send updated organisme to backend
    await axios.put(`${backendUrl}/organismes/update/${formData.id}`, formData);
    

    // Update local state so the list reflects changes
    /*setOrganismes((prev) =>
      prev.map((org) =>
        org.id === selectedOrganisme.id ? selectedOrganisme : org
      )
    );*/

    toast.success("Organisme modifié avec succès");
    setIsEditing(false);


    // Close modal
  } catch (error) {
    toast.error("erreur");
    console.error(error.response?.data || error);
  }
};

  return (
    <Card
      className="p-4 border-0 shadow-sm"
      style={{ background: "#faf9f6", border: "1px solid #dbd8d0", borderRadius: 14, padding: 24 }}
    >
      <h5 className="mb-4">Informations sur l'Organisme</h5>

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
        name="nomOrganisme"
        value={formData.nomOrganisme}
        readOnly={!isEditing}
        onChange={handleChange}
        required
      />
    </Form.Group>
  </Col>

  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>Type</Form.Label>
      <Form.Control
        type="text"
        name="type"
        value={formData.type}
        readOnly={!isEditing}
        onChange={handleChange}
        required
      />
    </Form.Group>
  </Col>
</Row>

<Form.Group className="mb-3">
  <Form.Label>Email</Form.Label>
  <Form.Control
    type="emailOrganisme"
    name="email"
    value={formData.emailOrganisme}
    readOnly={!isEditing}
    onChange={handleChange}
    required
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>N° Téléphone</Form.Label>
  <Form.Control
    type="text"
    name="telephone"
    value={formData.telephone}
    readOnly={!isEditing}
    onChange={handleChange}
    required
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>N° Fax</Form.Label>
  <Form.Control
    type="text"
    name="fax"
    value={formData.fax}
    readOnly={!isEditing}
    onChange={handleChange}
    required
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Adresse</Form.Label>
  <Form.Control
    type="text"
    name="adresse"
    value={formData.adresse}
    readOnly={!isEditing}
    onChange={handleChange}
    required
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Secteur</Form.Label>
  <Form.Control
    type="text"
    name="secteur"
    value={formData.secteur}
    readOnly={!isEditing}
    onChange={handleChange}
    required
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Date Création</Form.Label>
  <Form.Control
    type="date"
    name="dateCreation"
    value={formData.dateCreation}
    readOnly={!isEditing}
    onChange={handleChange}
    required
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

export default OrganismeInfoTab;