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
import Principes from "./Administrateur/principes.jsx";
import Evaluation from "./evaluation.jsx";
import EvaluationForm from "./evaluationForm.jsx";
import EvaluationsListe from "./Evaluateur/evaluationsListe.jsx";
import HomepageEval from "./Evaluateur/homepageEval.jsx";
import EvaluationDetails from "./Evaluateur/evaluationDetails.jsx";
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
                <Route path="/principes" element={<Principes />}/>
                <Route path="/evaluation" element={<Evaluation />}/>
                <Route path="/evaluationForm" element={<EvaluationForm />}/>
                <Route path="/evaluationsListe" element={<EvaluationsListe />}/>
                <Route path="/homepageEval" element={<HomepageEval />}/>
                <Route path="/evaluateur/evaluations/:id" element={<EvaluationDetails />} />


            </Routes>
    )
}
export default AppRoutes;