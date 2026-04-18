import { createContext } from "react";
import React from "react";
import { Appconstants } from "../util/constants";
import { useState,useEffect } from "react";
import axios from "axios";

export const AppContext = React.createContext();


export const AppContextProvider = (props) => {
    const backendUrl = Appconstants.BACKEND_URL; // Exemple d'URL de backend
    //const [isloggedIn, setIsloggedIn] = React.useState(false); // Exemple d'état de connexion
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    /*const [userData, setUserData] = useState(
        JSON.parse(sessionStorage.getItem("userData")) || null
        );*/
    
    const loadUser = async () => {
    try {
      const res = await axios.get(`${backendUrl}/users/me`, {
        withCredentials: true
      });

      setUserData(res.data);
      setIsLoggedIn(true);
    } catch (err) {
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

    const contextValue = {
        // Ajoutez ici les valeurs que vous souhaitez partager dans le contexte
        backendUrl,
        isLoggedIn,setIsLoggedIn,
        userData, setUserData,
    };
    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    )
}
