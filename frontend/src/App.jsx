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

function App() {
  return (
    <>
      <Routes>
        {/* Redirect root URL to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="menu" replace />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="pricing" element={<DynamicPricing />} />
            <Route path="approvals" element={<h2 className="text-muted p-4">Account Approvals (Coming Soon)</h2>} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="helpdesk" element={<h2 className="text-muted p-4">Admin Helpdesk (Coming Soon)</h2>} />
            <Route path="students" element={<StudentDirectory />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;