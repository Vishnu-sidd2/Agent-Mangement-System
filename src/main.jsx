import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import axios from "axios";

// Set default axios base URL
axios.defaults.baseURL =
  import.meta.env.VITE_API_PROXY === "true" ? "" : "http://localhost:5000";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
