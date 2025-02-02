import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Button,
  Grid,
  Snackbar,
} from "@mui/material";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/abi";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedGroup } from "../store/app.slice";
import "./Header.css";

const Header = () => {
  const [groupNames, setGroupNames] = useState([]);
  const [contract, setContract] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);

  const selectedGroupName = useSelector((state) => state.app.selectedGroup);
  const dispatch = useDispatch();

  // Initialize Ethers.js and contract instance
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );
            setContract(contractInstance);
          }
        } catch (error) {
          console.error("Error initializing provider:", error);
          setErrorMessage("Error initializing provider.");
        }
      } else {
        setErrorMessage("Please install MetaMask to use this feature.");
      }
    };
    init();
  }, []);

  // Fetch group names when contract is initialized
  useEffect(() => {
    const fetchGroupNames = async () => {
      if (!contract) return;
      try {
        const groupNames = await contract.getGroupNames();
        console.log("Groups:", groupNames);
        setGroupNames(groupNames);
      } catch (error) {
        console.error("Error fetching group names:", error);
        setErrorMessage("Error fetching group names.");
      }
    };
    fetchGroupNames();
  }, [contract]);

  // Handle MetaMask account change
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress(null);
        setErrorMessage("Please connect to MetaMask.");
      }
    };

    if (window.ethereum) {
      console.log("Listening for account changes...");
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        console.log("Removing account change listener...");
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log("Connected account:", accounts[0]);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Connection error:", error);
        setErrorMessage("Error connecting wallet.");
      }
    } else {
      setErrorMessage("Please install MetaMask!");
    }
  };

  return (
    <>
      <AppBar position="static" color="default" className="header-bar">
        <Toolbar>
          <Grid container alignItems="center">
            {/* Left Side: Select Dropdown */}
            <Grid item xs={4}>
              <Select
                value={selectedGroupName}
                onChange={(e) => dispatch(setSelectedGroup(e.target.value))}
                className="header-select"
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>
                  Select a group
                </MenuItem>
                {groupNames.map((groupName) => (
                  <MenuItem key={groupName} value={groupName}>
                    {groupName}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Center: Search Bar */}
            <Grid item xs={4}>
              <TextField
                label="Search Your Files"
                variant="outlined"
                size="small"
                className="header-search"
                fullWidth
              />
            </Grid>

            {/* Right Side: Wallet and Avatar */}
            <Grid
              item
              xs={4}
              container
              alignItems="center"
              justifyContent="flex-end"
              spacing={2}
            >
              {/* MetaMask Connect Button */}
              <Grid item>
                <Button
                  variant="contained"
                  onClick={connectWallet}
                  color="primary"
                  className="wallet-button"
                >
                  {walletAddress
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(walletAddress.length - 4)}`
                    : "Connect MetaMask"}
                </Button>
              </Grid>

              {/* Avatar */}
              <Grid item>
                <Avatar className="header-avatar">U</Avatar>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </>
  );
};

export default Header;
