import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import "../App.css";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
          <Link to="/student/dashboard" className={`sidebar-link ${isActive('/student/dashboard')}`}>
            <i className="bi bi-speedometer2"></i>
            <span className="link-text">Dashboard</span>
          </Link>
          

          <div className="sidebar-link text-muted opacity-50 cursor-not-allowed">
            <i className="bi bi-gear"></i>
            <span className="link-text">Settings</span>
          </div>
        </nav>
      </aside>

      {/* --- THE MAIN CONTENT AREA --- */}
      <div className="admin-main-wrapper">
        
        {/* The Top Navbar */}
        <header className="admin-top-nav d-flex justify-content-between align-items-center px-4">
          <div>
            <h4 className="m-0 fs-5 fw-bold nav-title">Student Portal</h4>
            <small className="text-muted fw-medium">Welcome back, {user.name}</small>
          </div>
          
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                 <i className="bi bi-mortarboard-fill text-secondary fs-5"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="fw-bold text-dark lh-1">{user.name}</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Student</span>
              </div>
            </div>
            
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

export default StudentLayout;
