import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

const navItems = [
 /* {
    to: "/homepage",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },*/
  /*{
    to: "/evaluation",
    label: "Evaluations",
    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  },*/
  {
    to: "/evaluationForm",
    label: "Nouvelle evaluation",
    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  },
  {
    to: "/dashboardsResp",
    label: "Dashboards",
    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn, userData } = React.useContext(AppContext);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = userData?.nom || "not found";
  const displayRole = userData?.jobRole || "not found";

  return (
    <>
      <div className="sse-sidebar">
        {/* Logo */}
        <div className="sse-logo">
          <span className="sse-logo-badge">🏛</span>
          <span className="sse-logo-text">SSE</span>
        </div>

        <div className="sse-divider" />

        {/* Nav */}
        <nav className="sse-nav">
          {navItems.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to} className={`sse-nav-link ${isActive ? "active" : ""}`}>
                <span className="sse-nav-icon">{icon}</span>
                <span className="sse-nav-label">{label}</span>
                {isActive && <span className="sse-active-pip" />}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div className="sse-divider" />

        {/* User Profile Card */}
        <div className="sse-user-area" ref={menuRef}>

          {/* Popover Menu */}
          {menuOpen && (
            <div className="sse-popover">
              <Link
                to="/profilepage"
                className="sse-popover-item"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Mon profil
              </Link>
              <div className="sse-popover-divider" />
              <button className="sse-popover-item danger" onClick={handleLogout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Déconnexion
              </button>
            </div>
          )}

          {/* Profile Row */}
          <button
            className="sse-user-card"
            onClick={() => setMenuOpen((p) => !p)}
          >
            <div className="sse-avatar">{getInitials(displayName)}</div>
            <div className="sse-user-info">
              <span className="sse-user-name">{displayName}</span>
              <span className="sse-user-role">{displayRole}</span>
            </div>
            <svg
              className={`sse-chevron ${menuOpen ? "open" : ""}`}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .sse-sidebar {
          display: flex;
          flex-direction: column;
          width: 220px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: #0c0c10;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 24px 14px 16px;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          z-index: 100;
        }

        .sse-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 6px;
          margin-bottom: 20px;
        }

        .sse-logo-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #fff;
          flex-shrink: 0;
        }

        .sse-logo-text {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #f0eeff;
        }

        .sse-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 8px 0;
        }

        .sse-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 8px;
        }

        .sse-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .sse-nav-link:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          text-decoration: none;
        }

        .sse-nav-link.active {
          background: rgba(108,99,255,0.15);
          color: #a78bfa;
        }

        .sse-nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .sse-nav-label { flex: 1; }

        .sse-active-pip {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #8b7ff5;
          flex-shrink: 0;
        }

        /* ── User area ── */
        .sse-user-area {
          position: relative;
          margin-top: 8px;
        }

        .sse-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease;
          text-align: left;
        }

        .sse-user-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
        }

        .sse-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d6b4e, #2db87a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.04em;
        }

        .sse-user-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .sse-user-name {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sse-user-role {
          font-size: 11px;
          color: rgba(255,255,255,0.38);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        .sse-chevron {
          flex-shrink: 0;
          color: rgba(255,255,255,0.3);
          transition: transform 0.2s ease;
        }

        .sse-chevron.open {
          transform: rotate(180deg);
        }

        /* ── Popover ── */
        .sse-popover {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #1a1a22;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 6px;
          box-shadow: 0 -8px 24px rgba(0,0,0,0.4);
          animation: sse-fade-up 0.15s ease;
        }

        @keyframes sse-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sse-popover-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          font-family: inherit;
          text-align: left;
        }

        .sse-popover-item:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.95);
          text-decoration: none;
        }

        .sse-popover-item.danger {
          color: rgba(248,113,113,0.75);
        }

        .sse-popover-item.danger:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }

        .sse-popover-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 4px 0;
        }
      `}</style>
    </>
  );
}

export default Sidebar;    