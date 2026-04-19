import { useState,useContext } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'; // Importation directe du CSS (Correction ici)
import Login from './pages/Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from './pages/Routes.jsx'
import { AppContext } from './context/AppContext.jsx';

//import { AppContextProvider } from './context/AppContext.jsx'
  function App(){
        const { loadingUser } = useContext(AppContext);
        if (loadingUser) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }
  return (
    <>
        <AppRoutes/>
      <ToastContainer position="top-right" autoClose={1000} />
    </>
  )
}


export default App
