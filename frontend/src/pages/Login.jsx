import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};
    if (!form.email) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email format";
    if (!form.password) err.password = "Password is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerMessage({ type: "", text: "" });
    if (!validate()) return;
    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setServerMessage({ type: "success", text: "Login successful! Redirecting..." });

          setTimeout(() => {
            if (data.user.role === "admin") {
              navigate("/admin/menu");
            } else {
              navigate("/student/dashboard");
            }
          }, 1000);
        } else {
          setServerMessage({ type: "danger", text: data.message || "Invalid credentials" });
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        setServerMessage({ type: "danger", text: 'Login failed. Please try again later.' });
      });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, #ff416c 0%, #f8f9fc 40%)' }}>
      
      {/* Broader Horizontal Card */}
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '900px', width: '100%', minHeight: '550px' }}>
        <div className="row g-0 h-100">
          
          {/* LEFT: Branding Panel */}
          <div className="col-md-5 d-none d-md-flex flex-column justify-content-center align-items-center p-5 text-center" style={{ backgroundColor: '#16181d', color: 'white' }}>
            <div className="mb-4 bg-white rounded-circle d-flex justify-content-center align-items-center shadow-lg" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-hexagon-fill fs-1" style={{ background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            </div>
            <h2 className="fw-bold mb-3">SmartMess</h2>
            <p className="text-white-50 small mb-0 px-3">
              The intelligent, automated way to manage student dining, leaves, and financial ledgers.
            </p>
          </div>

          {/* RIGHT: Login Form */}
          <div className="col-md-7 d-flex flex-column justify-content-center bg-white p-5">
            <div className="w-100 px-lg-4">
              <div className="mb-4 text-center text-md-start">
                <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
                <p className="text-muted small">Sign in to your account to continue</p>
              </div>

              {serverMessage.text && (
                <div className={`alert alert-${serverMessage.type} py-2 small`} role="alert">
                  {serverMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold text-secondary small">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control modern-input py-2 ${errors.email ? 'is-invalid border-danger' : ''}`}
                    placeholder="Enter your email"
                    onChange={handleChange}
                  />
                  {errors.email && <small className="text-danger mt-1">{errors.email}</small>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-bold text-secondary small">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control modern-input py-2 ${errors.password ? 'is-invalid border-danger' : ''}`}
                    placeholder="Enter your password"
                    onChange={handleChange}
                  />
                  {errors.password && <small className="text-danger mt-1">{errors.password}</small>}
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="form-label fw-bold text-secondary small">Role</label>
                  <select
                    id="role"
                    name="role"
                    className="form-select modern-input py-2"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn btn-gradient btn-lg w-100 fw-bold rounded-pill shadow-sm mb-4">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="text-center mb-4">
                <small className="text-muted">Don't have an account? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#ff4b2b' }}>Register here</Link></small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;