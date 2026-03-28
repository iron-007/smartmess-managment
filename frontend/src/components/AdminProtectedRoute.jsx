import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Check if there is a token and if the user role is admin
  if (!token || !user || user.role !== "admin") {
    // Redirect to login if not authorized
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child routes (the dashboard features)
  return <Outlet />;
};

export default AdminProtectedRoute;