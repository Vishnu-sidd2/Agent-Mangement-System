import React from "react";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <h1>Welcome to MERN Agent Management System</h1>
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/about" element={<h2>About Page</h2>} />
      </Routes>
    </div>
  );
}

export default App;
