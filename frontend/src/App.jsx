import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import MenuManager from "./components/MenuManager";
import DynamicPricing from "./components/DynamicPricing";
import NoticeBoard from "./components/NoticeBoard";
import StudentDirectory from "./components/StudentDirectory"; 
import AccountApproval from "./components/AccountApproval";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";

// Butler Imports
import ButlerProtectedRoute from "./components/ButlerProtectedRoute";
import ButlerLayout from "./components/ButlerLayout";
import ButlerDashboard from "./pages/ButlerDashboard";

function App() {
  return (
    <>
      <Routes>
        {/* Redirect root URL to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Butler Protected Routes (Account Approvals shifted here) */}
        <Route path="/butler" element={<ButlerProtectedRoute />}>
          <Route element={<ButlerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ButlerDashboard />} />
            <Route path="notices" element={<NoticeBoard />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="menu" replace />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="pricing" element={<DynamicPricing />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="helpdesk" element={<h2 className="text-muted p-4">Admin Helpdesk (Coming Soon)</h2>} />
            <Route path="students" element={<StudentDirectory />} />
          </Route>
        </Route>

        {/* Student Protected Routes */}
        <Route path="/student" element={<ProtectedRoute />}>
          <Route element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;