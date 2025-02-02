// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import store from "./store/store";

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
