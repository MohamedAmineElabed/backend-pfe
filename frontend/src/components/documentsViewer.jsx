import React from "react";
import { useParams } from "react-router-dom";

const DocumentViewer = () => {
  const { filename } = useParams(); // get filename from URL
  const fileUrl = `http://localhost:8080/api/v1.0/uploads/${encodeURIComponent(filename)}`;
  const googleViewer = `https://docs.google.com/gview?url=${fileUrl}&embedded=true`;

  const handleOpenInNewTab = () => {
    window.open(googleViewer, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={handleOpenInNewTab}
        style={{
          padding: "10px 16px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Ouvrir le document dans un nouvel onglet
      </button>
    </div>
  );
};

export default DocumentViewer;