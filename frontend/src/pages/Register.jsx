import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", urn: "", crn: "",
    degree: "", department: "", batch: "", year: "", hostel: "",
    messAccount: "", password: "", role: "student", position: "manager",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};
    if (!form.firstName) err.firstName = "First name required";
    if (!form.lastName) err.lastName = "Last name required";
    if (!form.email) err.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email format";
    if (!form.password) err.password = "Password required";
    else if (form.password.length < 6) err.password = "Password must be at least 6 characters";
    
    if (form.role === "student") {
      if (!form.urn) err.urn = "URN required";
      if (!form.crn) err.crn = "CRN required";
      if (!form.degree) err.degree = "Degree required";
      if (!form.department) err.department = "Department required";
      if (!form.batch) err.batch = "Batch required";
      if (!form.year) err.year = "Year required";
      if (!form.hostel) err.hostel = "Hostel required";
      if (!form.messAccount) err.messAccount = "Mess account required";
    } else if (form.role === "admin") {
      if (!form.position) err.position = "Position required";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerMessage({ type: "", text: "" });
    if (!validate()) return;
    setLoading(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    if (form.role === "student") {
      Object.assign(payload, {
        urn: form.urn, crn: form.crn, degree: form.degree,
        department: form.department, batch: form.batch,
        year: form.year, hostel: form.hostel, messAccount: form.messAccount,
      });
    } else if (form.role === "admin") {
      payload.position = form.position;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.message === "User registered successfully") {
          setServerMessage({ type: "success", text: "Registration successful! Redirecting..." });
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setServerMessage({ type: "danger", text: data.message || "Registration failed." });
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        setServerMessage({ type: "danger", text: "Registration failed. Please try again." });
      });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, #ff416c 0%, #f8f9fc 40%)' }}>
      
      {/* Even broader card to handle all the inputs cleanly */}
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "1000px", width: "100%" }}>
        <div className="row g-0">
          
          {/* LEFT: Branding Panel */}
          <div className="col-md-4 d-none d-md-flex flex-column justify-content-center align-items-center p-5 text-center" style={{ backgroundColor: '#16181d', color: 'white' }}>
            <div className="mb-4 bg-white rounded-circle d-flex justify-content-center align-items-center shadow-lg" style={{ width: '80px', height: '80px' }}>
               <i className="bi bi-person-vcard fs-1" style={{ background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            </div>
            <h3 className="fw-bold mb-3">Join SmartMess</h3>
            <p className="text-white-50 small mb-0 px-2">
              Register for your account to access menus, manage leaves, and view your real-time mess bill.
            </p>
          </div>

          {/* RIGHT: Registration Form */}
          <div className="col-md-8 bg-white p-5">
            <div className="mb-4 text-center text-md-start">
              <h3 className="fw-bold text-dark mb-1">Create an Account</h3>
              <p className="text-muted small">Fill in the details below to get started</p>
            </div>

            {serverMessage.text && (
              <div className={`alert alert-${serverMessage.type} py-2 small`} role="alert">
                {serverMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Role Toggle Switch */}
              <div className="mb-4 p-2 bg-light rounded-pill d-inline-flex border">
                <div className="form-check form-check-inline m-0 ps-0">
                  <input type="radio" className="btn-check" name="role" id="roleStudent" value="student" checked={form.role === "student"} onChange={handleChange} />
                  <label className="btn rounded-pill px-4 fw-bold" htmlFor="roleStudent" style={form.role === 'student' ? { background: '#16181d', color: 'white'} : { color: '#6c757d' }}>Student</label>
                </div>
                <div className="form-check form-check-inline m-0 ps-0">
                  <input type="radio" className="btn-check" name="role" id="roleAdmin" value="admin" checked={form.role === "admin"} onChange={handleChange} />
                  <label className="btn rounded-pill px-4 fw-bold" htmlFor="roleAdmin" style={form.role === 'admin' ? { background: '#16181d', color: 'white'} : { color: '#6c757d' }}>Admin</label>
                </div>
              </div>
              
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small mb-1">First Name</label>
                  <input name="firstName" className="form-control modern-input" placeholder="First name" onChange={handleChange} />
                  {errors.firstName && <small className="text-danger mt-1">{errors.firstName}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small mb-1">Last Name</label>
                  <input name="lastName" className="form-control modern-input" placeholder="Last name" onChange={handleChange} />
                  {errors.lastName && <small className="text-danger mt-1">{errors.lastName}</small>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary small mb-1">Email Address</label>
                <input name="email" type="email" className="form-control modern-input" placeholder="College email address" onChange={handleChange} />
                {errors.email && <small className="text-danger mt-1">{errors.email}</small>}
              </div>

              {form.role === "admin" && (
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small mb-1">Position</label>
                  <select name="position" className="form-select modern-input" value={form.position} onChange={handleChange}>
                    <option value="manager">Manager</option>
                    <option value="butler">Butler</option>
                  </select>
                </div>
              )}

              {form.role === "student" && (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small mb-1">URN</label>
                      <input name="urn" className="form-control modern-input" placeholder="Enter URN" onChange={handleChange} />
                      {errors.urn && <small className="text-danger mt-1">{errors.urn}</small>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small mb-1">CRN</label>
                      <input name="crn" className="form-control modern-input" placeholder="Enter CRN" onChange={handleChange} />
                      {errors.crn && <small className="text-danger mt-1">{errors.crn}</small>}
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small mb-1">Degree</label>
                      <select name="degree" className="form-select modern-input" value={form.degree} onChange={handleChange}>
                        <option value="">Select Degree</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small mb-1">Department</label>
                      <select name="department" className="form-select modern-input" value={form.department} onChange={handleChange}>
                        <option value="">Select Department</option>
                        <option value="Computer Science and Engineering">CSE</option>
                        <option value="Information Technology">IT</option>
                        <option value="Mechanical Engineering">ME</option>
                        <option value="Civil Engineering">CE</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary small mb-1">Batch</label>
                      <input name="batch" className="form-control modern-input" placeholder="e.g. 2021-25" onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary small mb-1">Year</label>
                      <select name="year" className="form-select modern-input" value={form.year} onChange={handleChange}>
                        <option value="">Year</option>
                        <option value="1">1st</option>
                        <option value="2">2nd</option>
                        <option value="3">3rd</option>
                        <option value="4">4th</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary small mb-1">Hostel</label>
                      <select name="hostel" className="form-select modern-input" value={form.hostel} onChange={handleChange}>
                        <option value="">Hostel</option>
                        <option value="1">H1</option>
                        <option value="2">H2</option>
                        <option value="3">H3</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="row g-3 mb-4">
                {form.role === "student" && (
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary small mb-1">Mess Account No.</label>
                    <input name="messAccount" className="form-control modern-input" placeholder="Account No." onChange={handleChange} />
                    {errors.messAccount && <small className="text-danger mt-1">{errors.messAccount}</small>}
                  </div>
                )}
                <div className={form.role === "student" ? "col-md-6" : "col-12"}>
                  <label className="form-label fw-bold text-secondary small mb-1">Password</label>
                  <input type="password" name="password" className="form-control modern-input" placeholder="Create password" onChange={handleChange} />
                  {errors.password && <small className="text-danger mt-1">{errors.password}</small>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-gradient btn-lg w-100 fw-bold rounded-pill shadow-sm mt-2 mb-3">
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">Already have an account? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#ff4b2b' }}>Sign in here</Link></small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;