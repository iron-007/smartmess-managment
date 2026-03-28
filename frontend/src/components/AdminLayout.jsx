import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3 shadow" style={{ width: "260px" }}>
        <h3 className="fs-4 text-center mb-4 text-primary fw-bold">SmartMess</h3>
        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link to="/admin/menu" className="nav-link text-white rounded">
              Menu Manager
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/pricing" className="nav-link text-white rounded">
              Dynamic Pricing
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/approvals" className="nav-link text-white rounded">
              Account Approvals
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/notices" className="nav-link text-white rounded">
              Notice Board
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/helpdesk" className="nav-link text-white rounded">
              Admin Helpdesk
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/students" className="nav-link text-white rounded">
              Student Directory
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
          <h4 className="m-0 fs-5 fw-semibold">Admin Dashboard</h4>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted fw-semibold">Hello, {user?.name || "Admin"}</span>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm fw-semibold">Logout</button>
          </div>
        </header>

        {/* Dynamic Page Content Renders Here */}
        <main className="p-4 flex-grow-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;