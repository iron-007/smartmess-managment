import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ButlerProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Butler dashboard accessible by both Butler and Admin
  if (!token || !user || (user.role !== "butler" && user.role !== "admin")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ButlerProtectedRoute;
