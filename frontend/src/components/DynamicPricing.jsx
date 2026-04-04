import React, { useState, useEffect } from "react";

const DynamicPricing = () => {
  const [pricing, setPricing] = useState({
    student: { breakfast: 30, lunch: 50, dinner: 50, special: 80 },
    guest: { breakfast: 50, lunch: 80, dinner: 80, special: 120 },
    rules: { noticeHours: 24 }
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
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/admin/pricing", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.pricing) setPricing(data.pricing);
          if (data.auditLog) setAuditLog(data.auditLog);
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
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(pricing)
      });

      if (response.ok) {
        const data = await response.json();
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

  return (
    <div className="container-fluid py-2">
      
      {/* PAGE HEADER */}
      <div className="mb-4">
        <h2 className="nav-title fw-bold m-0">
          <i className="bi bi-tags-fill me-2"></i>Dynamic Pricing
        </h2>
        <p className="text-muted small mt-1 mb-0">Configure per-meal costs and mess financial rules</p>
      </div>
      
      <div className="row g-4">
        
        {/* LEFT COLUMN: Main Form & Logs */}
        <div className="col-lg-8">
          
          {/* PRICING FORM CARD */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            {/* Dark Header */}
            <div className="bg-sidebar-dark p-3 px-4">
               <h5 className="fw-bold m-0 text-white">
                 <i className="bi bi-currency-rupee text-white-50 me-2"></i>Billing Configuration
               </h5>
            </div>

            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="table-responsive">
                  <table className="table table-borderless align-middle mb-4">
                    <thead className="border-bottom border-2">
                      <tr>
                        <th className="text-muted fw-bold text-uppercase small pb-3">Meal Type</th>
                        <th className="text-muted fw-bold text-uppercase small pb-3 text-center">Student Price</th>
                        <th className="text-muted fw-bold text-uppercase small pb-3 text-center">Guest Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["breakfast", "lunch", "dinner", "special"].map((meal) => (
                        <tr key={meal} className="border-bottom">
                          <td className="fw-bold text-secondary text-capitalize py-3">
                            {meal === 'special' ? (
                              <><i className="bi bi-star-fill text-warning me-2"></i>Sunday / Festival</>
                            ) : meal}
                          </td>
                          <td className="py-3 px-3">
                            <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                              <span className="input-group-text bg-light border-0 text-muted fw-bold">₹</span>
                              <input type="number" className="form-control border-0 modern-input rounded-0 bg-white" 
                                value={pricing.student[meal]} onChange={(e) => handleNestedChange('student', meal, e.target.value)} min="0" required />
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                              <span className="input-group-text bg-light border-0 text-muted fw-bold">₹</span>
                              <input type="number" className="form-control border-0 modern-input rounded-0 bg-white" 
                                value={pricing.guest[meal]} onChange={(e) => handleNestedChange('guest', meal, e.target.value)} min="0" required />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RULES SECTION */}
                <div className="row g-3 bg-light p-3 rounded-4 border border-light mt-2 align-items-center">
                  <div className="col-md-7">
                     <h6 className="fw-bold text-dark mb-1"><i className="bi bi-shield-lock text-muted me-2"></i>Minimum Rebate Notice</h6>
                     <small className="text-muted">Hours required before meal time to pause charges.</small>
                  </div>
                  <div className="col-md-5">
                    <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                      <input type="number" className="form-control border-0 modern-input rounded-0 bg-white text-center fw-bold" 
                        value={pricing.rules?.noticeHours || ''} onChange={(e) => handleNestedChange('rules', 'noticeHours', e.target.value)} min="0" required />
                      <span className="input-group-text bg-light border-0 text-muted fw-semibold">Hours</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top text-end">
                  <button type="submit" className="btn btn-gradient btn-lg px-5 rounded-pill shadow-sm fw-bold" disabled={isLoading}>
                    <i className="bi bi-shield-check me-2"></i>
                    {isLoading ? "Saving Updates..." : "Save Pricing & Rules"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AUDIT LOG CARD */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="bg-sidebar-dark p-3 px-4">
               <h5 className="fw-bold m-0 text-white">
                 <i className="bi bi-clipboard-data text-white-50 me-2"></i>Pricing Audit Log
               </h5>
            </div>
            <div className="card-body p-0 bg-white">
              <div className="table-responsive">
                 <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                       <tr>
                          <th className="px-4 py-3 text-muted small text-uppercase fw-semibold">Date</th>
                          <th className="py-3 text-muted small text-uppercase fw-semibold">Action</th>
                          <th className="py-3 text-muted small text-uppercase fw-semibold">Admin</th>
                       </tr>
                    </thead>
                    <tbody className="text-secondary fw-medium">
                       {auditLog.map((log, index) => (
                          <tr key={log._id} className={index !== auditLog.length -1 ? "border-bottom" : ""}>
                             <td className="px-4 py-3">
                               <span className="badge bg-light text-dark border"><i className="bi bi-calendar3 me-1"></i>{log.date}</span>
                             </td>
                             <td className="py-3">{log.action}</td>
                             <td className="py-3">
                               <i className="bi bi-person-badge text-muted me-2"></i>{log.admin}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN: Information Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4" style={{ backgroundColor: '#fcfcfd', border: '1px solid #eef0f4' }}>
             <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-white rounded-circle shadow-sm d-flex justify-content-center align-items-center me-3" style={{width: '45px', height: '45px'}}>
                    <i className="bi bi-info-circle-fill fs-4 nav-title"></i>
                  </div>
                  <h5 className="fw-bold text-dark m-0">How It Works</h5>
                </div>
                
                <p className="text-muted mb-4 small">The values configured here strictly dictate the automated billing ledger.</p>
                
                <ul className="list-unstyled text-secondary small">
                    <li className="mb-3 d-flex align-items-start">
                      <i className="bi bi-check-circle-fill text-success mt-1 me-2"></i>
                      <span>Students are billed precisely on the <strong>Per-Meal Costs</strong> only for the meals they consume.</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <i className="bi bi-check-circle-fill text-success mt-1 me-2"></i>
                      <span>Students can pause their accounts for any number of days to stop charges.</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <i className="bi bi-clock-fill text-warning mt-1 me-2"></i>
                      <span>A strict notice period of <strong>{pricing.rules?.noticeHours || 24} hours</strong> is required to cancel a meal successfully.</span>
                    </li>
                    <li className="d-flex align-items-start">
                      <i className="bi bi-shield-lock-fill text-primary mt-1 me-2"></i>
                      <span><strong>Immutable Ledger:</strong> Updating these prices only affects future days. Past generated bills cannot be altered.</span>
                    </li>
                </ul>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicPricing;