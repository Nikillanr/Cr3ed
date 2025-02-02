import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Button, Modal, Box } from "@mui/material";
import { Description as FileIcon } from "@mui/icons-material";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/abi";
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";
import "./QuickAccess.css";
import EmployeeManagement from "./EmployeeManagement";
import { useSelector } from "react-redux";

const QuickAccess = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [contract, setContract] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [fileType, setFileType] = useState("");
  const [decryptedFileName, setDecryptedFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const selectedGroupName = useSelector((state) => state.app.selectedGroup);
  const projectId = "2IOUFPp6jaCvviGV7nMOkXaRtab";
  const projectSecret = "37d7e98f26e5136a5f6a6055fc1ca7db";
  const authorization =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  const client = ipfsHttpClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization,
    },
  });

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contractInstance);
      } else {
        alert("Please install MetaMask!");
      }
    };
    initContract();
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      if (contract && selectedGroupName) {
        try {
          const [fileNames, fileHashes] = await contract.getFilesByGroup(
            selectedGroupName
          );
          const files = fileNames.map((name, index) => ({
            name,
            hash: fileHashes[index],
            index,
          }));
          setUploadedFiles(files);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      }
    };
    fetchFiles();
  }, [contract, selectedGroupName]);

  const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const decryptFile = async (
    encryptedContent,
    encryptedSymmetricKeyHex,
    iv,
    walletAddress
  ) => {
    try {
      const decryptedSymmetricKeyBase64 = await window.ethereum.request({
        method: "eth_decrypt",
        params: [encryptedSymmetricKeyHex, walletAddress],
      });

      const symmetricKey = base64ToArrayBuffer(decryptedSymmetricKeyBase64);
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        new Uint8Array(symmetricKey),
        "AES-GCM",
        false,
        ["decrypt"]
      );

      const decryptedContentArrayBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(base64ToArrayBuffer(iv)),
          tagLength: 128,
        },
        cryptoKey,
        new Uint8Array(base64ToArrayBuffer(encryptedContent))
      );

      return decryptedContentArrayBuffer;
    } catch (error) {
      console.error("Error decrypting file:", error);
      throw error;
    }
  };

  const handleDecryptFile = async (file) => {
    if (!file.hash) return;
    setDecrypting(true);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Accounts:", accounts);
    const walletAddress = accounts[0];

    // get file type from extension of file name
    const ext = file.name.split(".").pop();
    let fileTypeTemp;
    if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif") {
      fileTypeTemp = "image/" + ext;
    } else {
      fileTypeTemp = "application/" + ext;
    }

    setFileType(fileTypeTemp);

    try {
      const encryptedSymmetricKeyHex = await contract.getEncryptedSymmetricKey(
        selectedGroupName,
        file.index
      );

      console.log("Encrypted symmetric key:", encryptedSymmetricKeyHex);

      const key = file.hash;
      const enc_file_data = await client.cat(key);
      let enc_data = [];
      for await (const chunk of enc_file_data) {
        enc_data.push(chunk);
      }
      enc_data = Buffer.concat(enc_data).toString("utf8");
      const encryptedFile = JSON.parse(enc_data);

      const { encryptedContent, iv } = encryptedFile;

      const decryptedContentArrayBuffer = await decryptFile(
        encryptedContent,
        encryptedSymmetricKeyHex,
        iv,
        walletAddress
      );

      const blob = new Blob([decryptedContentArrayBuffer], {
        type: fileTypeTemp,
      });
      const url = window.URL.createObjectURL(blob);

      // Set file details for modal preview
      setDecryptedData(url);
      setDecryptedFileName(file.name); // Set filename for display and download
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error decrypting file:", error);
      alert("Error decrypting file. Please try again.");
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="quick-access">
      <Typography variant="h6" className="quick-access-title">
        Quick Access - {selectedGroupName}
      </Typography>
      <Grid container spacing={2}>
        {uploadedFiles.map((file, index) => (
          <Grid item key={index} xs={12} sm={6} lg={6}>
            <Paper
              className="quick-access-card"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              <FileIcon className="file-icon" />
              <div>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2">{file.hash}</Typography>
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  window.open(
                    `https://ipfs.infura.io/ipfs/${file.hash}`,
                    "_blank"
                  )
                }
              >
                View File
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDecryptFile(file)}
                disabled={decrypting}
              >
                {decrypting ? "Decrypting..." : "Decrypt"}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <EmployeeManagement />

      {/* Modal for displaying decrypted data */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          className="decrypted-modal-content"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ p: 4, backgroundColor: "#fff", maxWidth: "500px", mx: "auto" }}
        >
          <Typography variant="h6" className="decrypted-title" gutterBottom>
            {decryptedFileName}
          </Typography>
          {fileType && fileType.startsWith("image/") ? (
            <img
              src={decryptedData}
              alt="Decrypted file"
              style={{ maxWidth: "100%", marginTop: "10px" }}
            />
          ) : (
            <a href={decryptedData} download={decryptedFileName}>
              <Button variant="contained" color="primary">
                Download {decryptedFileName}
              </Button>
            </a>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default QuickAccess;
