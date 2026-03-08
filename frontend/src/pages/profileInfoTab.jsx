import React from 'react';
import { useEffect, useState } from 'react';
import { useContext} from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import axios from 'axios';
import { toast } from "react-toastify";

const ProfileInfoTab = ({ user }) => {
  const { backendUrl } = useContext(AppContext);
  const [isEditing,setIsEditing]=useState(false);
  const [formData,setFormData]=useState({
    id: user?.id || "",
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    organisme: user?.organisme || "",
    role: user?.role || ""
  });
  useEffect(()=>{
    if(user){
      setFormData({
        id: user?.id || "",
        nom: user?.nom || "",
        prenom: user?.prenom || "",
        email: user?.email || "",
        telephone: user?.telephone || "",
        organisme: user?.organisme || "",
        role: user?.role || ""

      })
    }

  },[user]);

  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]: e.target.value})
  }

  const handleCancel=()=>{
    setIsEditing(false);
    setFormData({
      id: user?.id || "",
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      organisme: user?.organisme || "",
      role: user?.role || ""
    });
  }
  
  const handlesave=async()=>{
    try {
        const response = await axios.put(`${backendUrl}/users/update`,formData)
        toast.success("mise à jour avec success!")
        setIsEditing(false);
      } catch (error) {
        toast.error("Erreur lors de mise à jour profil");
        console.log(error);
      } 
  }

  return (
    <Card className="p-4 border-0 shadow-sm" 
    style={{ background:"#faf9f6", border:"1px solid #dbd8d0", borderRadius:14, padding:24 }}>
      <h5 className="mb-4">Informations</h5>
      {!isEditing &&(
        <Button
          size="sm"
          className="position-absolute top-0 end-0 m-3"
          onClick={() => setIsEditing(true)}>
          Modifier
        </Button>
      )}

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              { /*to allow the user to edit informations we need value + onChange + name*/}
              <Form.Control type="text"  name="nom" value={formData.nom || ""} readOnly={!isEditing}   onChange={handleChange}
 />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control type="text" name="prenom" value={formData.prenom || ""} readOnly={!isEditing}   onChange={handleChange}
 />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label> 
          <Form.Control type="email" name="email" value={formData.email || ""} readOnly={!isEditing}   onChange={handleChange}
 />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Numéro telephone</Form.Label>
          { /*to allow the user to edit informations we need value + onChange + name*/}
          <Form.Control type="text"  name="telephone" value={formData.telephone || ""} readOnly={!isEditing}   onChange={handleChange}
 />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Organisme</Form.Label>
          <Form.Control type="text" name="organisme" value={formData.organisme || ""} readOnly={!isEditing}   onChange={handleChange}
 />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rôle</Form.Label>
          <Form.Control type="text" name="role" value={formData.role || ""} readOnly={!isEditing || formData.role=="ADMIN"}   onChange={handleChange}
 />
        </Form.Group>

        {/*button enregistrer et annuler */}
        {isEditing &&(
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleCancel}>
              Annuler
            </Button>

            <Button variant="success" onClick={handlesave}>
              Enregistrer
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
};

export default ProfileInfoTab;