import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react';
import { useContext} from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import axios from 'axios';
import { toast } from "react-toastify";


function CardProfil({user}){
    const { backendUrl } = useContext(AppContext);
      const [isEditing,setIsEditing]=useState(false);
      const [formData,setFormData]=useState({
       id: user?.id || "",
            nom: user?.nom || "",
            prenom: user?.prenom || "",
            email: user?.email || "",
            organisme: user?.organisme || "",
            role: user?.role || ""
    
      });
      const abreviation = formData?.prenom && formData?.nom
    ? formData.prenom.charAt(0).toUpperCase() +
      formData.nom.charAt(0).toUpperCase()
    : "?";
      useEffect(()=>{
        if(user){
          setFormData({
            id: user?.id || "",
            nom: user?.nom || "",
            prenom: user?.prenom || "",
            email: user?.email || "",
            organisme: user?.organisme || "",
            typeOrganisme: user?.typeOrganisme || "",
            role: user?.role || ""
    
          })
        }
    
      },[user]);
    return(
    <>
    <div style={{ background:"#faf9f6", border:"1px solid #dbd8d0", borderRadius:14, padding:22, marginBottom:20, display:"flex", alignItems:"center", gap:20,  }}>
          <div style={{ width:72, height:72, borderRadius:12, background:"#2563c7", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1.4rem", fontWeight:700, flexShrink:0 }}>{abreviation}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:"1.05rem", marginBottom:3 }}></div>
            <div style={{ fontSize:"0.78rem", color:"#78746c", fontFamily:"monospace", marginBottom:8 }}></div>
            <div style={{ display:"flex", gap:7 }}>
              <span style={{ background:"#dbeafe", color:"#2563c7", borderRadius:20, padding:"3px 10px", fontSize:"0.68rem", fontWeight:700 }}>{formData?.role}</span>
              <span style={{ background:"#dcfce7", color:"#0e8c52", borderRadius:20, padding:"3px 10px", fontSize:"0.68rem", fontWeight:700 }}>✓ Actif</span>
            </div>
          </div>
          <div style={{ background:"#f0f4ff", border:"1px solid #dbe4ff", borderRadius:10, padding:"14px 20px", textAlign:"center", flexShrink:0 }}>
            <div style={{ fontSize:"1.4rem" }}>⬡</div>
            <div style={{ fontWeight:700, fontSize:"0.82rem" }}></div>
            <div style={{ fontSize:"0.68rem", color:"#78746c", fontFamily:"monospace" }}>{formData?.typeOrganisme}</div>
          </div>
    </div>
    </>
)

}

export default CardProfil;