import { BrowserRouter, Routes, Route} from "react-router-dom";
import { AppContextProvider } from "../context/AppContext.jsx";
import ListDemandes from "./Administrateur/listDemandes.jsx";
import Login from "./Login.jsx";
import Homepage from "./homepage.jsx";
import Profilepage from "./profilepage.jsx";
import HomePageAdmin from "./Administrateur/homePageAdmin.jsx";
import VerifyAccount from "../components/verifyAccount.jsx";
function AppRoutes(){
    return(
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/" element={<Login />} />
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/listDemandes" element={<ListDemandes />} />
                <Route path="/profilepage" element={<Profilepage/>}></Route>
                <Route path="/homePageAdmin" element={<HomePageAdmin/>}></Route>
                <Route path="/verifyAccount" element={<VerifyAccount />}></Route>
                <Route path="/verifyAccount/:demandeId" element={<VerifyAccount />} />

                
            </Routes>
    )
}
export default AppRoutes;