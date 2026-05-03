import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../App.css";
const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to find the active link
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "SmartMess | Admin";
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Helper function to check if link is active
  const isActive = (path) => location.pathname.includes(path) ? "active" : "";

  return (
    <div className="bg-light min-vh-100">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- THE SIDEBAR --- */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
        <header className="admin-top-nav d-flex justify-content-between align-items-center px-3 px-md-4">
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Mobile Sidebar Toggle Button */}
            <button 
              className="btn btn-link d-md-none p-0 text-dark border-0" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="bi bi-three-dots-vertical fs-4 text-gradient"></i>
            </button>
            <div className="d-flex flex-column">
              {/* Added the new nav-title class here */}
              <h4 className="m-0 fs-6 fs-md-5 fw-bold nav-title text-truncate" style={{ maxWidth: '140px' }}>Admin</h4>
              <small className="text-muted fw-medium mt-1 d-none d-md-block">Manage your mess operations efficiently</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2 gap-md-4">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '36px', height: '36px' }}>
                 <i className="bi bi-person-fill text-secondary fs-6"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="fw-bold text-dark lh-1" style={{ fontSize: '0.85rem' }}>{user?.name || "System Admin"}</span>
                <span className="text-muted d-none d-sm-block" style={{ fontSize: '0.75rem' }}>Administrator</span>
              </div>
            </div>
            
            {/* Applied the new btn-logout class here */}
            <button onClick={handleLogout} className="btn btn-logout rounded-pill px-3 px-md-4 py-2 py-md-1 fw-semibold d-flex align-items-center gap-2">
              <span className="d-none d-md-block">Logout</span>
              <i className="bi bi-box-arrow-right"></i>
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