import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'  //Import bootstrap CSS
import { AppContextProvider } from './context/AppContext.jsx'
import axios from 'axios'

axios.defaults.withCredentials = true;
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

//Attach token to every request automatically
axios.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
     <AppContextProvider> 
      <App />
     </AppContextProvider> 
  </BrowserRouter>,
)
