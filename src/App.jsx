import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Patients from "./components/Patients.jsx";
import Finance from "./components/Finance.jsx";
import Departments from "./components/Departments.jsx";
import Notifications from "./components/Notifications.jsx";
import Complaints from "./components/Complaints.jsx";
import AuditLog from "./components/AuditLog.jsx";
import MedicalCommission from "./components/MedicalCommission.jsx";
import Schedule from "./components/Schedule.jsx";
import SelectionCommission from "./components/SelectionCommission.jsx";
import Staff from "./components/Staff.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/auditlog" element={<AuditLog />} />
        <Route path="/medicalcommission" element={<MedicalCommission />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/selectioncommission" element={<SelectionCommission />} />
        <Route path="/staff" element={<Staff />} />
      </Routes>
    </BrowserRouter>
  );
}