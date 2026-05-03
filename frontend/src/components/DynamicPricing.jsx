import React, { useState, useEffect } from "react";
import api from "../utils/api";

const DynamicPricing = () => {
  const [pricing, setPricing] = useState({
    student: { breakfast: 30, lunch: 50, dinner: 50, special: 80 },
    guest: { breakfast: 50, lunch: 80, dinner: 80, special: 120 },
    rules: { noticeHours: 24 },
    extraPrices: {}
  });

  // Mock audit log for demonstration
  const [auditLog, setAuditLog] = useState([
    { _id: "log1", date: "2023-10-01", action: "Increased Student Lunch from ₹45 to ₹50", admin: "Jane Doe" },
    { _id: "log2", date: "2023-09-15", action: "Updated Base Mess Fee to ₹1200", admin: "System Admin" },
    { _id: "log3", date: "2023-08-01", action: "Set Guest Special Feast to ₹120", admin: "John Smith" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get("/api/admin/pricing");
        const data = response.data;

        if (data.pricing) {
          setPricing(prev => ({
            ...prev,
            ...data.pricing
          }));
        }

        if (data.auditLog) {
          setAuditLog(data.auditLog);
        }
      } catch (error) {
        console.error("Failed to fetch pricing data:", error);
      }
    };

    fetchPricing();
  }, []);

  const handleNestedChange = (category, field, value) => {
    setPricing({
      ...pricing,
      [category]: { ...pricing[category], [field]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.put("/api/admin/pricing", pricing);

      if (response.status === 200) {
        const data = response.data;
        if (data.auditLog) setAuditLog(data.auditLog);
        alert("Dynamic pricing and rules updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to update pricing"}`);
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      alert("Network error occurred while saving the pricing rules.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMealIcon = (meal) => {
    switch (meal) {
      case 'breakfast': return <i className="bi bi-sunrise text-warning fs-5"></i>;
      case 'lunch': return <i className="bi bi-sun text-danger fs-5"></i>;
      case 'dinner': return <i className="bi bi-moon-stars fs-5" style={{ color: 'var(--brand-secondary)' }}></i>;
      case 'special': return <i className="bi bi-star text-success fs-5"></i>;
      default: return <i className="bi bi-cup-hot text-secondary fs-5"></i>;
    }
  };

  return (
    <>
      <style>{`
      .transition-all { transition: all 0.3s ease; }
      .hover-shadow:hover { box-shadow: var(--shadow-md) !important; }
      .hover-scale:hover { transform: translateY(-3px); }
      .hover-bg-danger:hover { background-color: #dc3545 !important; }
      .hover-text-white:hover { color: white !important; }
      .hover-bg-light:hover { background-color: #f8f9fa !important; }
      .border-dashed { border-style: dashed !important; border-width: 2px !important; }
      .hover-border-brand:hover { border-color: var(--brand-primary) !important; }
      .brand-icon-bg { background: var(--brand-gradient); color: white; }
    `}</style>
      <div className="container-fluid py-4 px-2 px-md-4 slide-up" style={{ minHeight: "100vh" }}>

        {/* PAGE HEADER */}
        <div className="mb-5 d-flex align-items-center justify-content-between fade-in px-2 px-md-0">
          <div>
            <h2 className="nav-title m-0 d-flex align-items-center" style={{ letterSpacing: "-0.5px" }}>
              <span className="brand-icon-bg p-2 rounded-3 me-3 shadow-sm d-inline-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', WebkitTextFillColor: 'white' }}>
                <i className="bi bi-hexagon-fill fs-4"></i>
              </span>
              <span className="text-gradient">Dynamic Pricing</span>
            </h2>
            <p className="text-muted mt-2 mb-0 fs-6 ms-1">Configure per-meal costs, manage billing rules, and extra item prices dynamically.</p>
          </div>
        </div>

        <div className="row g-4">

          {/* LEFT COLUMN: Main Form */}
          <div className="col-lg-8 fade-in" style={{ animationDelay: '0.1s' }}>

            {/* PRICING FORM CARD */}
            <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden bg-white">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-3 px-md-4">
                <h5 className="nav-title m-0 d-flex align-items-center text-gradient">
                  <i className="bi bi-sliders me-2" style={{ color: 'var(--brand-primary)' }}></i> Base Meal Pricing
                </h5>
                <p className="text-muted small mt-1 mb-0">Set the default rates applied to daily mess billing.</p>
              </div>

              <div className="card-body px-2 px-md-4 py-4">
                <form onSubmit={handleSubmit}>
                  {/* DESKTOP VIEW */}
                  <div className="table-responsive rounded-4 border mb-4 shadow-sm d-none d-md-block">
                    <table className="table table-borderless align-middle mb-0 table-hover">
                      <thead className="bg-light border-bottom">
                        <tr>
                          <th className="text-muted fw-bold text-uppercase small py-3 ps-4" style={{ letterSpacing: "1px" }}>Meal Type</th>
                          <th className="text-muted fw-bold text-uppercase small py-3 text-center" style={{ letterSpacing: "1px" }}>Student Rate</th>
                          <th className="text-muted fw-bold text-uppercase small py-3 text-center pe-4" style={{ letterSpacing: "1px" }}>Guest Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['breakfast', 'lunch', 'dinner', 'special'].map((meal) => (
                          <tr key={meal} className="border-bottom">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className="me-3">{getMealIcon(meal)}</div>
                                <span className="text-dark fw-bold text-capitalize">{meal}</span>
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <div className="input-group input-group-sm justify-content-center mx-auto" style={{ maxWidth: '120px' }}>
                                <span className="input-group-text bg-white border-end-0">₹</span>
                                <input
                                  type="number"
                                  className="form-control border-start-0 text-center fw-bold"
                                  value={pricing.student[meal]}
                                  onChange={(e) => handleNestedChange('student', meal, parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </td>
                            <td className="text-center py-3 pe-4">
                              <div className="input-group input-group-sm justify-content-center mx-auto" style={{ maxWidth: '120px' }}>
                                <span className="input-group-text bg-white border-end-0">₹</span>
                                <input
                                  type="number"
                                  className="form-control border-start-0 text-center fw-bold"
                                  value={pricing.guest[meal]}
                                  onChange={(e) => handleNestedChange('guest', meal, parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE VIEW */}
                  <div className="d-md-none mb-4 d-flex flex-column gap-3">
                    {['breakfast', 'lunch', 'dinner', 'special'].map((meal) => (
                      <div key={meal} className="border rounded-4 p-3 shadow-sm bg-white">
                        <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                          <div className="me-2">{getMealIcon(meal)}</div>
                          <span className="text-dark fw-bold text-capitalize fs-6">{meal}</span>
                        </div>
                        <div className="row g-3">
                          <div className="col-6">
                            <label className="small text-muted mb-1 fw-bold">Student Rate</label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-light border-end-0">₹</span>
                              <input
                                type="number"
                                className="form-control border-start-0 fw-bold"
                                value={pricing.student[meal]}
                                onChange={(e) => handleNestedChange('student', meal, parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <div className="col-6">
                            <label className="small text-muted mb-1 fw-bold">Guest Rate</label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-light border-end-0">₹</span>
                              <input
                                type="number"
                                className="form-control border-start-0 fw-bold"
                                value={pricing.guest[meal]}
                                onChange={(e) => handleNestedChange('guest', meal, parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* EXTRA ITEM PRICING SECTION */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="nav-title m-0 d-flex align-items-center">
                          <i className="bi bi-cup-hot-fill text-warning me-2"></i> Extra Items
                        </h6>
                        <p className="text-muted small mt-1 mb-0">Configure prices for individual add-ons.</p>
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold shadow-sm d-flex align-items-center transition-all" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }} onClick={() => {
                        const itemName = prompt("Enter item name (e.g. Milk, Egg, Extra Paneer):");
                        if (itemName && itemName.trim() !== '') {
                          const newExtras = pricing.extraPrices ? { ...pricing.extraPrices } : {};
                          newExtras[itemName.trim()] = 0;
                          setPricing({ ...pricing, extraPrices: newExtras });
                        }
                      }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-gradient)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-primary)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}>
                        <i className="bi bi-plus-lg me-1"></i> Add Item
                      </button>
                    </div>

                    <div className="row g-3">
                      {(!pricing.extraPrices || Object.keys(pricing.extraPrices).length === 0) && (
                        <div className="col-12 text-center py-5 bg-light rounded-4 border border-dashed">
                          <i className="bi bi-inbox text-muted fs-1 mb-3 d-block opacity-50"></i>
                          <h6 className="fw-bold text-dark mb-1">No extra items configured</h6>
                          <p className="text-muted small mb-0">Click the 'Add Item' button above to start adding à la carte items.</p>
                        </div>
                      )}
                      {pricing.extraPrices && Object.entries(pricing.extraPrices).map(([item, price]) => (
                        <div key={item} className="col-md-4">
                          <div className="card border shadow-sm bg-white p-3 rounded-4 h-100 position-relative transition-all hover-scale hover-border-brand">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <span className="fw-bold text-dark fs-6 text-truncate pe-3">{item}</span>
                              <button type="button" className="btn btn-sm btn-light text-danger rounded-circle p-1 d-flex align-items-center justify-content-center position-absolute top-0 end-0 mt-2 me-2 border hover-bg-danger hover-text-white transition-all" style={{ width: '28px', height: '28px' }} onClick={() => {
                                const newExtras = { ...pricing.extraPrices };
                                delete newExtras[item];
                                setPricing({ ...pricing, extraPrices: newExtras });
                              }}>
                                <i className="bi bi-x-lg" style={{ fontSize: "0.8rem" }}></i>
                              </button>
                            </div>
                            <div className="input-group input-group-sm rounded-3 overflow-hidden bg-light mt-auto">
                              <span className="input-group-text bg-light border-0 text-muted px-3 fw-bold">₹</span>
                              <input
                                type="number"
                                className="form-control border-0 modern-input bg-light fw-bold text-dark fs-6 py-2 rounded-0 rounded-end"
                                value={price}
                                onChange={(e) => {
                                  const newExtras = { ...pricing.extraPrices };
                                  newExtras[item] = parseInt(e.target.value) || 0;
                                  setPricing({ ...pricing, extraPrices: newExtras });
                                }}
                                min="0"
                                style={{ boxShadow: "none" }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-top text-end mt-4">
                    <button type="submit" className="btn btn-gradient btn-lg px-5 py-2 rounded-pill shadow-sm fw-bold d-inline-flex align-items-center transition-all" disabled={isLoading}>
                      {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving Updates...</>
                      ) : (
                        <><i className="bi bi-shield-check me-2 fs-5"></i> Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>


          {/* RIGHT COLUMN: Info & Audit Log */}
          <div className="col-lg-4 d-flex flex-column gap-4 fade-in" style={{ animationDelay: '0.2s' }}>

            {/* HOW IT WORKS */}
            <div className="glass-panel position-relative overflow-hidden transition-all hover-shadow mb-4 rounded-4" style={{ background: "linear-gradient(135deg, rgba(255, 81, 47, 0.05) 0%, rgba(221, 36, 118, 0.05) 100%)", border: "1px solid rgba(255, 81, 47, 0.2)" }}>
              <div className="position-absolute top-0 end-0" style={{ transform: "translate(15%, -15%)", opacity: 0.06 }}>
                <i className="bi bi-info-circle-fill" style={{ fontSize: "140px", color: "var(--brand-secondary)" }}></i>
              </div>
              <div className="card-body p-3 p-md-4 position-relative z-1">
                <div className="d-flex align-items-center mb-4">
                  <div className="brand-icon-bg rounded-circle shadow-sm d-flex justify-content-center align-items-center me-3" style={{ width: '45px', height: '45px' }}>
                    <i className="bi bi-lightbulb-fill fs-5"></i>
                  </div>
                  <h5 className="nav-title m-0 text-gradient">How It Works</h5>
                </div>

                <p className="text-muted mb-4 small fw-medium pe-md-4">The values configured here strictly dictate the automated billing ledger.</p>

                <ul className="list-unstyled text-secondary small d-flex flex-column gap-3 mb-0">
                  <li className="d-flex align-items-start bg-white p-3 rounded-4 shadow-sm border border-light transition-all hover-shadow">
                    <i className="bi bi-check-circle-fill text-success mt-1 me-3 fs-5"></i>
                    <span>Students are billed precisely on the <strong className="text-dark">Per-Meal Costs</strong> for consumed meals.</span>
                  </li>
                  <li className="d-flex align-items-start bg-white p-3 rounded-4 shadow-sm border border-light transition-all hover-shadow">
                    <i className="bi bi-pause-circle-fill text-warning mt-1 me-3 fs-5"></i>
                    <span>A <strong className="text-dark">{pricing.rules?.noticeHours || 24} hours</strong> notice is required to cancel a meal successfully.</span>
                  </li>
                  <li className="d-flex align-items-start bg-white p-3 rounded-4 shadow-sm border border-light transition-all hover-shadow">
                    <i className="bi bi-shield-lock-fill mt-1 me-3 fs-5" style={{ color: 'var(--brand-primary)' }}></i>
                    <span><strong className="text-dark">Immutable Ledger:</strong> Updates only affect future days. Past generated bills cannot be altered.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* AUDIT LOG CARD */}
            <div className="card shadow-sm border-0 rounded-4 flex-grow-1 d-flex flex-column hover-shadow transition-all bg-white">
              <div className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex align-items-center justify-content-between">
                <h6 className="nav-title m-0 d-flex align-items-center">
                  <i className="bi bi-clock-history text-muted me-2 fs-5"></i> Recent Changes
                </h6>
                <span className="badge text-dark border rounded-pill px-3 py-2 fw-medium" style={{ backgroundColor: 'rgba(255, 81, 47, 0.1)', borderColor: 'rgba(255, 81, 47, 0.2)' }}>Last 5</span>
              </div>
              <div className="card-body p-0 bg-white rounded-bottom-4">
                <div className="list-group list-group-flush rounded-bottom-4">
                  {auditLog.length === 0 ? (
                    <div className="p-5 text-center text-muted small d-flex flex-column align-items-center">
                      <i className="bi bi-journal-x fs-1 text-light mb-2"></i>
                      No recent changes logged.
                    </div>
                  ) : auditLog.slice(0, 5).map((log, index) => (
                    <div key={log._id} className="list-group-item p-3 border-bottom-0 border-top hover-bg-light transition-all">
                      <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark text-truncate d-block" style={{ maxWidth: "75%", fontSize: "0.9rem" }}>{log.action}</span>
                        <span className="text-muted small fw-medium" style={{ fontSize: "0.75rem" }}><i className="bi bi-calendar-event me-1"></i>{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="text-muted d-flex align-items-center small" style={{ fontSize: "0.8rem" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px', backgroundColor: 'rgba(221, 36, 118, 0.1)' }}>
                          <i className="bi bi-person-fill" style={{ fontSize: '12px', color: 'var(--brand-secondary)' }}></i>
                        </div>
                        <span className="fw-medium">{log.admin}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default DynamicPricing;