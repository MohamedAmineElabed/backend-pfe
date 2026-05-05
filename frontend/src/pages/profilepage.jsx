import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { toast } from "react-toastify";
import axios from 'axios';
import Siderbar from '../components/siderbar.jsx';
import SiderbarAdmin from '../components/siderbarAdmin.jsx';
import SiderbarEval from '../components/siderbarEval.jsx';
import CardProfil from '../components/cardProfil.jsx';
import ProfileInfoTab from './profileInfoTab.jsx';
import OrganismeInfoTab from './organismeInfoTab.jsx';
import PasswordTab from './passwordTab.jsx';

const TABS = [
  { key: "info",          label: "Informations Personnelles" },
  { key: "infoOrganisme", label: "Informations sur l'Organisme" },
  { key: "password",      label: "Mot de Passe" },
];

function Profilepage() {
  const navigate = useNavigate();
  const { backendUrl, userData } = useContext(AppContext);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (!userData?.id) { setLoading(false); return; }
        const response = await axios.get(`${backendUrl}/users/${userData?.id}`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        toast.error("Erreur chargement profil");
      } finally {
        setLoading(false);
      }
    };
    console.log("UserData Context =", userData);
    console.log("UserData ID =", userData?.id);
    if (userData?.id) fetchInfo();
  }, [backendUrl, userData]);

  const visibleTabs = TABS.filter(tab =>tab.key !== "infoOrganisme" || user?.role === "RESPONSABLE"
);

  const SidebarComponent =
    user?.role === "ADMIN"      ? SiderbarAdmin :
    user?.role === "EVALUATEUR" ? SiderbarEval  : Siderbar;

  return (
    <div style={s.page}>
      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        <SidebarComponent />
      </div>

      {/* ── Main ── */}
      <div style={s.main}>

        {/* Page heading */}
        <div style={s.heading}>
          <span style={s.headingLabel}>Mon Profil</span>
          <div style={s.headingRule} />
        </div>

        {/* Profile card */}
        <div style={s.cardWrapper}>
          <CardProfil user={user} />
        </div>

        {/* Tab bar */}
        <div style={s.tabBar}>
          {visibleTabs.map(tab => (
            <button
              key={tab.key}
              style={{
                ...s.tabBtn,
                ...(activeTab === tab.key ? s.tabBtnActive : s.tabBtnInactive),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && <span style={s.tabUnderline} />}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div style={s.panel}>
          {activeTab === "info" && (
            <ProfileInfoTab user={user} />
          )}

          {activeTab === "infoOrganisme" && user?.role === "RESPONSABLE" && (
            user?.organisme
              ? <OrganismeInfoTab org={user.organisme} />
              : (
                <div style={s.emptyState}>
                  <span style={s.emptyIcon}>🏢</span>
                  <p style={s.emptyText}>Chargement des informations de l'organisme…</p>
                </div>
              )
          )}

          {activeTab === "password" && (
            <PasswordTab user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── styles ─────────────────────────── */
const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#F3EFE8",
    fontFamily: "'Georgia', serif",
  },

  sidebar: {
    width: 260,
    flexShrink: 0,
  },

  main: {
    flex: 1,
    padding: "40px 48px 60px 40px",
    minWidth: 0,
  },

  /* heading */
  heading: {
    marginBottom: 8,
  },
  headingLabel: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#2C2416",
    letterSpacing: "0.01em",
  },
  headingRule: {
    marginTop: 10,
    height: 2,
    background: "linear-gradient(to right, #C4AD88, transparent)",
    borderRadius: 2,
    marginBottom: 24,
  },

  /* card wrapper */
  cardWrapper: {
    marginBottom: 32,
  },

  /* tab bar */
  tabBar: {
    display: "flex",
    gap: 4,
    borderBottom: "2px solid #E8E0D0",
    marginBottom: 28,
  },
  tabBtn: {
    position: "relative",
    padding: "10px 20px 12px",
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  tabBtnActive: {
    color: "#2C2416",
  },
  tabBtnInactive: {
    color: "#B0A090",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    background: "#7C6A4A",
    borderRadius: "2px 2px 0 0",
    display: "block",
  },

  /* panel */
  panel: {
    maxWidth: 820,
  },

  /* empty state */
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: 12,
  },
  emptyIcon: {
    fontSize: "2.5rem",
    opacity: 0.4,
  },
  emptyText: {
    color: "#9A876A",
    fontSize: "0.92rem",
    fontFamily: "sans-serif",
    margin: 0,
  },
};

export default Profilepage;