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
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Combined Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top px-3 py-2 fade-in" style={{ zIndex: 1050 }}>
        <div className="container-fluid">
          {/* Brand */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/student/dashboard">
            <div className="rounded p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ background: 'var(--brand-gradient)' }}>
              <i className="bi bi-hexagon-fill text-white fs-5 lh-1"></i>
            </div>
            <span className="fw-bold fs-4 nav-title mb-0">SmartMess</span>
          </Link>

          {/* Mobile Toggle */}
          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#studentNavbar" aria-controls="studentNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Links & User Actions */}
          <div className="collapse navbar-collapse" id="studentNavbar">
            {/* Center/Left Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2 mt-3 mt-lg-0">
              <li className="nav-item">
                <Link to="/student/dashboard" className={`nav-link fw-bold px-4 py-2 rounded-pill transition-all ${isActive('/student/dashboard') ? 'bg-primary bg-opacity-10 text-primary' : 'text-secondary hover-bg-light'}`}>
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <span className="nav-link fw-medium px-4 py-2 rounded-pill text-muted opacity-50 cursor-not-allowed">
                  <i className="bi bi-gear me-2"></i>Settings
                </span>
              </li>
            </ul>

            {/* Right Side: User Profile & Logout */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0 border-lg-start ps-lg-4">
              <div className="d-flex align-items-center gap-2 py-1 px-3 rounded-pill bg-light border border-light transition-all hover-lift shadow-sm">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
                   <i className="bi bi-mortarboard-fill text-primary fs-6"></i>
                </div>
                <div className="d-flex flex-column d-none d-sm-flex">
                  <span className="fw-bold text-dark lh-1 small">{user.name || 'Student'}</span>
                </div>
              </div>
              
              <button onClick={handleLogout} className="btn btn-logout rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center transition-all">
                Logout <i className="bi bi-box-arrow-right ms-2 fs-6"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1 w-100 fade-in" style={{ background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
