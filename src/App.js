import React from "react";
import AdminDashboard from "./components/AdminView";
import CustomerDashboard from "./components/CustomerView";
import Login from "./components/Login";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  return (
    <Router>
      <div className="navbar">
        <h1 className="navbar-title">Ticketing System</h1>
      </div>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
        </Routes>
      </div>
      
    </Router>
  );

}

  


export default App;
