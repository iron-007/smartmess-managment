import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized access is attempted
    return <Navigate to={user.role === "admin" ? "/admin/menu" : "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;