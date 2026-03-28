import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "", // Changed from username
    password: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});

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

    if (!validate()) return;

    console.log("Login data:", form);
    // 👉 Call backend API here
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Route the user to their respective dashboard
          if (data.user.role === "admin") {
            navigate("/admin/menu");
          } else {
            navigate("/"); // Placeholder for future Student Dashboard
          }
        } else {
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Login failed');
      });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold text-primary">Welcome Back</h2>
          <p className="text-center text-muted mb-4">Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control form-control-lg"
                placeholder="Enter your email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <small className="text-danger mt-1 d-block">{errors.email}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control form-control-lg"
                placeholder="Enter your password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && (
                <small className="text-danger mt-1 d-block">{errors.password}</small>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="form-label fw-semibold">Role</label>
              <select
                name="role"
                id="role"
                className="form-select form-select-lg"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button className="btn btn-primary btn-lg w-100 mb-3 fw-semibold">Sign In</button>
          </form>

          <div className="text-center">
            <small className="text-muted">Don't have an account? <a href="/register" className="text-primary text-decoration-none fw-semibold">Register here</a></small>
          </div>
        </div>

        {/* Development Test Credentials */}
        <div className="mt-4 p-3 bg-light rounded-3 border">
          <h6 className="text-center mb-2 fw-semibold text-muted">Development Test Credentials</h6>
          <div className="row text-center">
            <div className="col-6">
              <small className="d-block fw-semibold">Admin</small>
              <small className="text-muted">admin@college.edu</small><br/>
              <small className="text-muted">AdminPass123</small>
            </div>
            <div className="col-6">
              <small className="d-block fw-semibold">Student</small>
              <small className="text-muted">student@college.edu</small><br/>
              <small className="text-muted">StudentPass123</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
