import { createContext } from "react";
import React from "react";
import { Appconstants } from "../util/constants";
import { useState } from "react";

export const AppContext = React.createContext();


export const AppContextProvider = (props) => {
    const backendUrl = Appconstants.BACKEND_URL; // Exemple d'URL de backend
    const [isloggedIn, setIsloggedIn] = React.useState(false); // Exemple d'état de connexion
    const [userData, setUserData] = useState(
        JSON.parse(localStorage.getItem("userData")) || null
        );

    const contextValue = {
        // Ajoutez ici les valeurs que vous souhaitez partager dans le contexte
        backendUrl,
        isloggedIn,setIsloggedIn,
        userData, setUserData,
    };
    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    )
}
