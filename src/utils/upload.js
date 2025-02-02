import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Buffer } from "buffer"; // Import Buffer from buffer package
const ascii85 = require("ascii85");

const provider = new ethers.providers.Web3Provider(window.ethereum);

const signer = provider.getSigner();

const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;
const authorization =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// IPFS client instance
const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization,
  },
});
