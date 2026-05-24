import { createContext } from "react";
import React from "react";
import { Appconstants } from "../util/constants";
import { useState,useEffect } from "react";
import axios from "axios";

export const AppContext = React.createContext();

//axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
export const AppContextProvider = (props) => {
    const backendUrl = Appconstants.BACKEND_URL; // Exemple d'URL de backend
    //const [isloggedIn, setIsloggedIn] = React.useState(false); // Exemple d'état de connexion
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [userData, setUserData] = useState(null);
    /*const [userData, setUserData] = useState(
        JSON.parse(sessionStorage.getItem("userData")) || null
        );*/
    
    const loadUser = async () => {
    try {
      const token = sessionStorage.getItem('token'); //read token
      //no token and no cookie = not logged in
            if (!token) {
                setUserData(null);
                setIsLoggedIn(false);
                setLoadingUser(false);
                return;
            }
      const res = await axios.get(`${backendUrl}/users/me`, {
        withCredentials: true,
        headers: {
                'ngrok-skip-browser-warning': 'true', //for ngrok
                ...(token && { Authorization: `Bearer ${token}` })
            }
      });

      setUserData(res.data);
      setIsLoggedIn(true);
    } catch (err) {
      setUserData(null);
      setIsLoggedIn(false);
      sessionStorage.removeItem('token'); //clear bad token
    }finally {
        setLoadingUser(false); //always runs
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
        loadingUser,
        loadUser,
    };
    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    )
}
