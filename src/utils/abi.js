// Contract ABI (paste your ABI here)
export const contractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_employeeAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_employeeName",
        type: "string",
      },
    ],
    name: "addEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_key",
        type: "string",
      },
    ],
    name: "addEmployeePublicKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
      {
        internalType: "address",
        name: "_employee",
        type: "address",
      },
    ],
    name: "addEmployeeToGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_fileName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_encfilehash",
        type: "string",
      },
      {
        internalType: "address[]",
        name: "_sharedWith",
        type: "address[]",
      },
      {
        internalType: "string[]",
        name: "_encryptedSymmetricKeys",
        type: "string[]",
      },
    ],
    name: "addFileToGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
    ],
    name: "createGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
      {
        internalType: "address",
        name: "_employee",
        type: "address",
      },
    ],
    name: "deleteEmployeeFromGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_publicKey",
        type: "string",
      },
    ],
    name: "setPublicKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_orgName",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "employeeAddrs",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "employeeNames",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "employeepk",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getEmployees",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
    ],
    name: "getEmployeesByGroup",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_fileIndex",
        type: "uint256",
      },
    ],
    name: "getEncryptedSymmetricKey",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_groupName",
        type: "string",
      },
    ],
    name: "getFilesByGroup",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGroupNames",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOrgDetails",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "groupCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "groups",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "fileCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_employeeAddress",
        type: "address",
      },
    ],
    name: "isEmployee",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "orgName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Contract Address (from Remix deployment)
export const contractAddress = "0xD84Df6b834e1c236d2bf4975E2088FaB373eB20E";

// https://sepolia.etherscan.io/tx/0x9a2dd5efe80c9dd068c6b20f82978e88f45d6aa720cf7e64ed21009fcf7b11a8