import React, { useState, useEffect } from "react";
import { Button, Typography, Upload, message, Select, Form, Input } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { encrypt } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/abi";
import "./Upload.css";

const { Option } = Select;

const UploadComponent = ({ addUploadedFile }) => {
  const [fileName, setFileName] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);
  const [fileType, setFileType] = useState(""); // Track file type
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [contract, setContract] = useState(null);
  const [groupName, setGroupName] = useState(""); // Assuming you have group management
  const [fileIndex, setFileIndex] = useState(0); // Index of the file in the group's file array
  const [groupNames, setGroupNames] = useState([]);
  // Replace with your actual Infura project credentials
  const [settingPublicKey, setSettingPublicKey] = useState(false); // Loading state for public key setup

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

  // Initialize Ethers.js and contract instance
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contractInstance);
          fetchEmployees(contractInstance);
          fetchGroupNames(contractInstance);
        } catch (error) {
          console.error("Error initializing provider:", error);
          message.error("Error initializing provider.");
        }
      } else {
        message.error("Please install MetaMask to use this feature.");
      }
    };
    init();
  }, []);

  // Fetch employee list from the contract
  const fetchEmployees = async (contractInstance) => {
    try {
      const [names, addresses] = await contractInstance.getEmployees();
      const employees = names.map((name, index) => ({
        name,
        address: addresses[index],
      }));
      setEmployeeList(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchGroupNames = async (contractInstance) => {
    try {
      const groupNames = await contractInstance.getGroupNames();
      console.log("Groups:", groupNames);

      setGroupNames(groupNames);
    } catch (error) {
      console.error("Error fetching group names:", error);
    }
  };

  // Utility functions for data conversion
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Function to get the wallet's public key
  const getWalletPublicKey = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [walletAddress],
      });
      if (!publicKey) {
        throw new Error("Encryption public key not found");
      }
      return publicKey;
    } catch (error) {
      console.error("Error fetching public key:", error);
      throw error;
    }
  };

  // Function to set user's public key in the contract
  const setPublicKey = async () => {
    setSettingPublicKey(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [walletAddress],
      });

      if (publicKey) {
        const tx = await contract.setPublicKey(publicKey);
        await tx.wait();
        message.success("Public key set successfully!");
      } else {
        throw new Error("Encryption public key not found");
      }
    } catch (error) {
      console.error("Error setting public key:", error);
      message.error("Error setting public key. Please try again.");
    } finally {
      setSettingPublicKey(false);
    }
  };

  // Function to fetch public keys of selected users
  const getPublicKeysOfUsers = async (addresses) => {
    const publicKeys = {};
    for (const address of addresses) {
      const publicKey = await contract.employeepk(address);
      if (publicKey && publicKey !== "") {
        publicKeys[address] = publicKey;
      } else {
        message.error(`Public key not found for address: ${address}`);
      }
    }
    return publicKeys;
  };

  // Function to encrypt the file
  const encryptFile = async (fileContent, publicKeys) => {
    try {
      // Generate a random symmetric key
      const symmetricKey = window.crypto.getRandomValues(new Uint8Array(32));

      // Import the symmetric key
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        symmetricKey,
        "AES-GCM",
        false,
        ["encrypt"]
      );

      // Encrypt the file content using the symmetric key
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce for AES-GCM
      const encryptedContentArrayBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
          tagLength: 128,
        },
        cryptoKey,
        fileContent
      );

      // Encrypt the symmetric key for each user
      const encryptedSymmetricKeys = {};
      for (const [address, publicKey] of Object.entries(publicKeys)) {
        const encryptedSymmetricKeyObject = encrypt({
          publicKey,
          data: arrayBufferToBase64(symmetricKey),
          version: "x25519-xsalsa20-poly1305",
        });

        // Convert the encrypted symmetric key object to hex string
        const encryptedSymmetricKeyHex =
          "0x" +
          Buffer.from(
            JSON.stringify(encryptedSymmetricKeyObject),
            "utf8"
          ).toString("hex");

        encryptedSymmetricKeys[address] = encryptedSymmetricKeyHex;
      }

      return {
        encryptedContent: arrayBufferToBase64(encryptedContentArrayBuffer),
        encryptedSymmetricKeys,
        iv: arrayBufferToBase64(iv),
      };
    } catch (error) {
      console.error("Error encrypting file:", error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      if (selectedUsers.length === 0) {
        message.error("Please select at least one user to share with.");
        return false;
      }

      if (!groupName) {
        message.error("Please enter a group name.");
        return false;
      }

      setUploading(true);
      setFileName(file.name);
      setFileType(file.type);

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async (event) => {
        try {
          const fileContent = event.target.result;

          // Fetch public keys of selected users
          const publicKeys = await getPublicKeysOfUsers(selectedUsers);

          // Encrypt the file
          const encryptedFile = await encryptFile(fileContent, publicKeys);

          // Prepare data for IPFS
          const encryptedFileData = {
            encryptedContent: encryptedFile.encryptedContent,
            iv: encryptedFile.iv,
          };
          const encryptedFileBuffer = Buffer.from(
            JSON.stringify(encryptedFileData)
          );

          // Upload encrypted file content to IPFS
          const addedFile = await client.add(encryptedFileBuffer);
          const fileUrl = `https://ipfs.infura.io/ipfs/${addedFile.path}`;
          setIpfsUrl(fileUrl);

          // Prepare encrypted symmetric keys and addresses
          const sharedWithAddresses = Object.keys(
            encryptedFile.encryptedSymmetricKeys
          );
          const encryptedSymmetricKeys = Object.values(
            encryptedFile.encryptedSymmetricKeys
          );
          console.log("Encrypted symmetric keys:", encryptedSymmetricKeys);
          console.log("Shared with addresses:", sharedWithAddresses);
          // Call smart contract to store file metadata
          const tx = await contract.addFileToGroup(
            groupName,
            file.name,
            addedFile.path, // Store IPFS hash
            sharedWithAddresses,
            encryptedSymmetricKeys
          );
          await tx.wait();

          addUploadedFile({
            name: file.name,
            url: fileUrl,
          });
          message.success("File uploaded and encrypted successfully!");
        } catch (error) {
          console.error("Error in reader.onload:", error);
          message.error("Error uploading file. Please try again.");
        } finally {
          setUploading(false);
        }
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Error uploading file. Please try again.");
      setUploading(false);
    }
    // Return false to prevent default upload behavior
    return false;
  };

  // Decrypt the file
  const decryptFile = async (
    encryptedContent,
    encryptedSymmetricKeyHex,
    iv,
    walletAddress
  ) => {
    try {
      // Decrypt the symmetric key using MetaMask
      const decryptedSymmetricKeyBase64 = await window.ethereum.request({
        method: "eth_decrypt",
        params: [encryptedSymmetricKeyHex, walletAddress],
      });

      const symmetricKey = base64ToArrayBuffer(decryptedSymmetricKeyBase64);

      // Import the symmetric key
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        new Uint8Array(symmetricKey),
        "AES-GCM",
        false,
        ["decrypt"]
      );

      // Decrypt the content
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

  // Handle file decryption
  const handleDecryptFile = async () => {
    if (!ipfsUrl) return;
    try {
      setDecrypting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

      if (!groupName) {
        message.error("Please enter the group name.");
        setDecrypting(false);
        return;
      }

      // Fetch encrypted symmetric key from contract
      const encryptedSymmetricKeyHex = await contract.getEncryptedSymmetricKey(
        groupName,
        fileIndex // Index of the file in the group's file array
      );

      // Fetch encrypted content and IV from IPFS
      const key = ipfsUrl.replace("https://ipfs.infura.io/ipfs/", "");
      const enc_file_data = await client.cat(key);
      let enc_data = [];
      for await (const chunk of enc_file_data) {
        enc_data.push(chunk);
      }
      enc_data = Buffer.concat(enc_data).toString("utf8");
      const encryptedFile = JSON.parse(enc_data);

      const { encryptedContent, iv } = encryptedFile;

      // Decrypt the file
      const decryptedContentArrayBuffer = await decryptFile(
        encryptedContent,
        encryptedSymmetricKeyHex,
        iv,
        walletAddress
      );

      // Create a Blob from the decrypted content
      const blob = new Blob([decryptedContentArrayBuffer], {
        type: fileType,
      });
      const url = window.URL.createObjectURL(blob);
      setDecryptedData(url);
      message.success("File decrypted successfully!");
    } catch (error) {
      console.error("Error decrypting file from IPFS:", error);
      message.error("Error decrypting file. Please try again.");
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="upload-container">
      <Typography.Title level={2} className="upload-title">
        Upload a File to IPFS with Encryption
      </Typography.Title>

      <Form layout="vertical">
        {/* <Form.Item label="Group Name">
          <Input
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Form.Item> */}

        <Form.Item label="Select Group">
          <Select
            placeholder="Select group"
            value={groupName}
            onChange={(value) => setGroupName(value)}
            style={{ width: "100%" }}
          >
            {groupNames.map((group) => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Select Users to Share With">
          <Select
            mode="multiple"
            placeholder="Select users to share with"
            value={selectedUsers}
            onChange={setSelectedUsers}
            style={{ width: "100%" }}
          >
            {employeeList.map((employee) => (
              <Option key={employee.address} value={employee.address}>
                {employee.name} ({employee.address})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Set Public Key Button */}
        <Form.Item>
          <Button
            type="primary"
            onClick={setPublicKey}
            loading={settingPublicKey}
          >
            {settingPublicKey ? "Setting Public Key..." : "Set My Public Key"}
          </Button>
        </Form.Item>

        {/* File Upload Button */}
        <Form.Item>
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            multiple={false}
            accept="*/*"
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={uploading || settingPublicKey}
            >
              {uploading ? "Uploading..." : "Encrypt and Upload File"}
            </Button>
          </Upload>
        </Form.Item>
      </Form>

      {ipfsUrl && (
        <div className="uploaded-file-container">
          <Typography.Title level={5} className="uploaded-file-title">
            File uploaded to IPFS:
          </Typography.Title>
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="uploaded-file-link"
          >
            {fileName} - {ipfsUrl}
          </a>
          <br />
          <Form layout="vertical" style={{ marginTop: "20px" }}>
            <Form.Item label="Group Name">
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="File Index">
              <Input
                type="number"
                placeholder="Enter file index"
                value={fileIndex}
                onChange={(e) => setFileIndex(parseInt(e.target.value))}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={decrypting}
                disabled={decrypting}
                onClick={handleDecryptFile}
              >
                {decrypting ? "Decrypting..." : "Decrypt File"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}

      {decryptedData && (
        <div className="decrypted-file-container" style={{ marginTop: "20px" }}>
          <Typography.Title level={5} className="decrypted-file-title">
            Decrypted File:
          </Typography.Title>
          {fileType.startsWith("image/") ? (
            <img
              src={decryptedData}
              alt="Decrypted file"
              style={{ maxWidth: "100%", marginTop: "10px" }}
            />
          ) : (
            <a
              href={decryptedData}
              download={fileName}
              className="decrypted-file-link"
            >
              <Button type="primary" icon={<DownloadOutlined />}>
                Download Decrypted File
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
