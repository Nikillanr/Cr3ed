// src/components/FileTable.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import "./FileTable.css";

const FileTable = ({ uploadedFiles }) => {
  return (
    <div className="file-table">
      <Typography variant="h6">Your Group Files</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Uploaded On</TableCell>
              <TableCell>Uploaded By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFiles.map((file, index) => (
              <TableRow key={index}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{file.uploadDate}</TableCell>
                <TableCell>{file.uploader}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default FileTable;
