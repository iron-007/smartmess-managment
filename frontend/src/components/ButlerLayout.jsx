import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const ButlerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.includes(path) ? "active" : "";

  return (
    <div className="bg-light min-vh-100">
      
      {/* --- THE SIDEBAR --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand mb-3">
          <i className="bi bi-hexagon-fill"></i>
          <span className="link-text fs-4 fw-bold text-white ms-2">SmartMess</span>
        </div>

        <nav className="d-flex flex-column gap-1">
          <Link to="/butler/dashboard" className={`sidebar-link ${isActive('/butler/dashboard')}`}>
            <i className="bi bi-grid-1x2"></i>
            <span className="link-text">Dashboard</span>
          </Link>

          
          <Link to="/butler/notices" className={`sidebar-link ${isActive('/butler/notices')}`}>
            <i className="bi bi-megaphone"></i>
            <span className="link-text">Notices</span>
          </Link>
        </nav>
      </aside>

      {/* --- THE MAIN CONTENT AREA --- */}
      <div className="admin-main-wrapper">
        <header className="admin-top-nav d-flex justify-content-between align-items-center px-4">
          <div>
            <h4 className="m-0 fs-5 fw-bold nav-title">Butler Dashboard</h4>
            <small className="text-muted fw-medium">Managing mess status & approvals</small>
          </div>
          
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                 <i className="bi bi-person-fill text-secondary fs-5"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="fw-bold text-dark lh-1">{user?.name}</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>{user?.role === 'admin' ? 'Super Admin' : 'Mess Butler'}</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="btn btn-logout rounded-pill px-4 fw-semibold">
              Logout <i className="bi bi-box-arrow-right ms-1"></i>
            </button>
          </div>
        </header>

        <main className="p-4 flex-grow-1 overflow-auto w-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ButlerLayout;
