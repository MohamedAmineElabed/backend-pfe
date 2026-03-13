import React from "react";
import SiderbarAdmin from "../../components/siderbarAdmin";

function HomePageAdmin() {
  return (
    <>
    <SiderbarAdmin/>
    <div style={{ display: "flex" }}>
      <div style={{ marginLeft: "220px", width: "100%" }}>
        <div className="container mt-5 text-center">
          <h1>Welcome to Homepage</h1>
          <p className="text-muted">
            You are successfully logged in.
          </p>
        </div>

      </div>
    </div>
    </>
  );
}

export default HomePageAdmin;