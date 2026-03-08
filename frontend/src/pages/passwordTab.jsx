import React from "react"; 
import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { useContext} from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { toast } from "react-toastify";
import axios from "axios";


const PasswordTab = ({ user }) => {
  const [isEditing,setIsEditing]=useState(true);
  const{backendUrl}=useContext(AppContext);
  const [passwordData,setPasswordData]=useState({
      userId:"",
      oldPassword:"",
      newPassword:"",
      confirmPassword:"",
    });
    useEffect(() => {
    if (user?.id) {
      setPasswordData(prev => ({
        ...prev,
        userId: user.id
      }));
    }
  }, [user]);

    const handleChange=(e)=>{
    setPasswordData({...passwordData,[e.target.name]: e.target.value})
  }
 const handlesave=async()=>{
  if(!passwordData.oldPassword || !passwordData.newPassword ||!passwordData.confirmPassword){
    toast.error("tous les champs doivent étre remplis");
    return;
  }
  if(passwordData.newPassword!==passwordData.confirmPassword){
    toast.error("les mots de passe ne correspond pas!");
    return;
  }

  try {
      const response = await axios.put(`${backendUrl}/users/update-password`,passwordData)
      toast.success("mise à jour avec success!")
      // Clear fields after success
    setPasswordData({
      userId: user.id,
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
  });

    } catch (error) {
      if (error.response && error.response.data) {
        toast.error("Erreur lors de mise à jour profil");
        toast.error("Mot de passe incorrect");
      }
      console.log(error);
      } 
  }
    
  return (
    <Card className="p-4 border-0 shadow-sm" 
    style={{ background:"#faf9f6", border:"1px solid #dbd8d0", borderRadius:14, padding:24, maxWidth:800 }}>
      <h5 className="mb-4">Mot de Passe</h5>

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe Actuel</Form.Label>
              <Form.Control type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handleChange}
              placeholder='******' required  />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau Mot de passe</Form.Label>
              <Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handleChange}
              placeholder='******' required   />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Confirmer Mot de passe</Form.Label>
          <Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handleChange}
          placeholder='******' required  />
        </Form.Group>

      </Form>

      {isEditing &&(
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="success" onClick={handlesave}>
              Enregistrer
            </Button>
          </div>
        )}
    </Card>
  );
};

export default PasswordTab;