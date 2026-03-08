import React from "react";
import Siderbar from "../../components/siderbar";

function HomePageAdmin() {
  return (
    <>
    <Siderbar/>
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