import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../App.css";
const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to find the active link
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Helper function to check if link is active
  const isActive = (path) => location.pathname.includes(path) ? "active" : "";

  return (
    <div className="bg-light min-vh-100">
      
      {/* --- THE SIDEBAR --- */}
      <aside className="admin-sidebar">
        {/* Brand/Logo */}
        <div className="sidebar-brand mb-3">
          <i className="bi bi-hexagon-fill"></i>
          <span className="link-text fs-4 fw-bold text-white ms-2">SmartMess</span>
        </div>

        {/* Navigation Links */}
        <nav className="d-flex flex-column gap-1">
          <Link to="/admin/menu" className={`sidebar-link ${isActive('/admin/menu')}`}>
            <i className="bi bi-journal-text"></i>
            <span className="link-text">Menu Manager</span>
          </Link>

          <Link to="/admin/pricing" className={`sidebar-link ${isActive('/admin/pricing')}`}>
            <i className="bi bi-tags"></i>
            <span className="link-text">Dynamic Pricing</span>
          </Link>

          <Link to="/admin/approvals" className={`sidebar-link ${isActive('/admin/approvals')}`}>
            <i className="bi bi-check-circle"></i>
            <span className="link-text">Account Approvals</span>
          </Link>

          <Link to="/admin/students" className={`sidebar-link ${isActive('/admin/students')}`}>
            <i className="bi bi-people"></i>
            <span className="link-text">Student Directory</span>
          </Link>

          <Link to="/admin/notices" className={`sidebar-link ${isActive('/admin/notices')}`}>
            <i className="bi bi-megaphone"></i>
            <span className="link-text">Notice Board</span>
          </Link>

          {/* <Link to="/admin/helpdesk" className={`sidebar-link ${isActive('/admin/helpdesk')}`}>
            <i className="bi bi-headset"></i>
            <span className="link-text">Helpdesk</span>
          </Link> */}
        </nav>
      </aside>

      {/* --- THE MAIN CONTENT AREA --- */}
      <div className="admin-main-wrapper">
        
        {/* The Top Navbar (Sticky & Elegant) */}
       {/* The Top Navbar */}
        <header className="admin-top-nav d-flex justify-content-between align-items-center px-4">
          <div>
            {/* Added the new nav-title class here */}
            <h4 className="m-0 fs-5 fw-bold nav-title">Admin Dashboard</h4>
            <small className="text-muted fw-medium">Manage your mess operations efficiently</small>
          </div>
          
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                 <i className="bi bi-person-fill text-secondary fs-5"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="fw-bold text-dark lh-1">{user?.name || "System Admin"}</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Administrator</span>
              </div>
            </div>
            
            {/* Applied the new btn-logout class here */}
            <button onClick={handleLogout} className="btn btn-logout rounded-pill px-4 fw-semibold">
              Logout <i className="bi bi-box-arrow-right ms-1"></i>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content Renders Here */}
        <main className="p-4 flex-grow-1 overflow-auto w-100">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;