import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'; // Importation directe du CSS (Correction ici)
import Login from './pages/Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from './pages/Routes.jsx'
//import { AppContextProvider } from './context/AppContext.jsx'
  function App(){
    
  return (
    <>
        <AppRoutes/>
      <ToastContainer position="top-right" autoClose={1000} />
    </>
  )
}


export default App
