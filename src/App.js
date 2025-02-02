import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FileTable from "./components/FileTable";
import QuickAccess from "./components/QuickAccess"; // Import QuickAccess
import Upload from "./components/Upload";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState("");

  const addUploadedFile = (file) => {
    setUploadedFiles([...uploadedFiles, file]);
  };
  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
      }
    };

    initializeProvider();
  }, []);

  useEffect(() => {
    if (provider) {
      const getNetwork = async () => {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      };

      getNetwork();
    }
  }, [provider]);

  return (
    <Router>
      <div style={{ background: "#1e1e1e", display: "flex" }}>
        <Sidebar />
        <div style={{ flexGrow: 1 }}>
          <Header />
          <Routes>
            <Route
              path="/"
              element={<QuickAccess uploadedFiles={uploadedFiles} />}
            />
            <Route
              path="/files"
              element={<FileTable uploadedFiles={uploadedFiles} />}
            />
            <Route
              path="/upload"
              element={<Upload addUploadedFile={addUploadedFile} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
