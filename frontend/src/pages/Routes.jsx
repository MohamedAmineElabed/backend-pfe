import { BrowserRouter, Routes, Route} from "react-router-dom";
import { AppContextProvider } from "../context/AppContext.jsx";
import ListDemandes from "./Administrateur/listDemandes.jsx";
import Login from "./Login.jsx";
import Homepage from "./homepage.jsx";
import Profilepage from "./profilepage.jsx";
import HomePageAdmin from "./Administrateur/homePageAdmin.jsx";
import VerifyAccount from "../components/verifyAccount.jsx";
import ListUtilisateurs from "./Administrateur/listUtilisateurs";
import ListOrganismes from "./Administrateur/listOrganismes";
function AppRoutes(){
    return(
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/" element={<Login />} />
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/listDemandes" element={<ListDemandes />} />
                <Route path="/profilepage" element={<Profilepage/>}/>
                <Route path="/homePageAdmin" element={<HomePageAdmin/>}/>
                <Route path="/verifyAccount" element={<VerifyAccount />}/>
                <Route path="/verifyAccount/:demandeId" element={<VerifyAccount />} />
                <Route path="/listUtilisateurs" element={<ListUtilisateurs />}/>
                <Route path="/listOrganismes" element={<ListOrganismes />}/>

                
            </Routes>
    )
}
export default AppRoutes;