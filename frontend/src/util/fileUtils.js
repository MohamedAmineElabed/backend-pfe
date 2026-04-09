// utils/fileUtils.js
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { useEffect, useState, useContext } from "react";

export const openFile = async (backendUrl, fileName) => {
  if (!fileName) return alert("Nom de fichier manquant.");

  try {
    const fileUrl = `${backendUrl}/files/${encodeURIComponent(fileName)}`;
    const response = await axios.get(fileUrl, { responseType: "blob" });

    // Use server MIME type if available
    let type = response.data.type || "";

    // Fallback MIME types
    if (!type) {
      const ext = fileName.split(".").pop().toLowerCase();
      const mimeTypes = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        txt: "text/plain",
        html: "text/html",
        json: "application/json",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
      };
      type = mimeTypes[ext] || "application/octet-stream";
    }

    const file = new Blob([response.data], { type });
    const fileObjectURL = URL.createObjectURL(file);

    // Decide whether to open or download
    const openableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "text/html",
      "application/json",
      "video/mp4",
      "audio/mpeg",
    ];

    if (openableTypes.includes(type)) {
      // Open in new tab
      window.open(fileObjectURL);
    } else {
      // Force download
      const link = document.createElement("a");
      link.href = fileObjectURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Revoke URL after some time
    setTimeout(() => URL.revokeObjectURL(fileObjectURL), 10000);
  } catch (err) {
    console.error("Impossible d'ouvrir le fichier :", err);
    alert("Impossible d'ouvrir ce fichier.");
  }
};