import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

function SiderbarAdmin() {
  const navigate = useNavigate();
  const { isloggedIn, setIsloggedIn, userData } = React.useContext(AppContext);

  const handleLogout = () => {
    setIsloggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <div
        className="d-flex flex-column vh-100 p-3 text-white position-fixed"
        style={{ width: 200, backgroundColor: "#0f0f13" }}
      >
        <div className="mb-4 fs-4 fw-bold text-center">SSE</div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <Link
            to="/homepageAdmin"
            className="nav-link text-white rounded hover-bg-secondary"
          >
            Home
          </Link>

          <Link
            to="/profilepage"
            className="nav-link text-white rounded hover-bg-secondary">
            Profile
          </Link>

            <Link
            to="/listDemandes"
            className="nav-link text-white rounded hover-bg-secondary">
            Liste des demandes
            </Link>

            <Link
            to="/principes"
            className="nav-link text-white rounded hover-bg-secondary">
            Principes
            </Link>

            <Link
            to="/listUtilisateurs"
            className="nav-link text-white rounded hover-bg-secondary">
            Liste utilisateurs
          </Link>

          <Link
            to="/listOrganismes"
            className="nav-link text-white rounded hover-bg-secondary">
            Liste organismes
          </Link>
        </nav>

        <button className="btn btn-danger mt-auto w-100" onClick={handleLogout}>
          Logout
        </button>

        <style>{`
          .hover-bg-secondary {
            transition: all 0.2s ease;
          }
          .hover-bg-secondary:hover {
            background-color: #495057 !important;
            /*padding-left: 8px;*/
          }
        `}</style>
      </div>
    </>
  );
}

export default SiderbarAdmin;