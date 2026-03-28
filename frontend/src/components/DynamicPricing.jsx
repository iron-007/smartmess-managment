import React, { useState, useEffect } from "react";

const DynamicPricing = () => {
  const [pricing, setPricing] = useState({
    baseFee: 1200,
    student: { breakfast: 30, lunch: 50, dinner: 50, special: 80 },
    guest: { breakfast: 50, lunch: 80, dinner: 80, special: 120 },
    rules: { noticeHours: 24, maxLeaveDays: 10 }
  });

  // Mock audit log for demonstration
  const [auditLog, setAuditLog] = useState([
    { _id: "log1", date: "2023-10-01", action: "Increased Student Lunch from ₹45 to ₹50", admin: "Jane Doe" },
    { _id: "log2", date: "2023-09-15", action: "Updated Base Mess Fee to ₹1200", admin: "System Admin" },
    { _id: "log3", date: "2023-08-01", action: "Set Guest Special Feast to ₹120", admin: "John Smith" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial pricing data on component mount
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
  
  const handleBaseChange = (field, value) => {
    setPricing({ ...pricing, [field]: value });
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
        if (data.auditLog) setAuditLog(data.auditLog); // Refresh audit log from server response
        alert("Dynamic pricing and rules updated successfully!");
      } else {
        try {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Failed to update pricing"}`);
        } catch (parseError) {
          alert(`Server Error: ${response.status} ${response.statusText}. Please check if the backend route exists.`);
        }
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      alert("Network error occurred while saving the pricing rules.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold text-primary">Dynamic Pricing</h2>
      
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Per-Meal Costs</h5>
              <form onSubmit={handleSubmit}>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light text-muted">
                      <tr>
                        <th>Meal Type</th>
                        <th>Student Price (₹)</th>
                        <th>Guest Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["breakfast", "lunch", "dinner", "special"].map((meal) => (
                        <tr key={meal}>
                          <td className="text-capitalize fw-semibold">
                            {meal === 'special' ? 'Sunday / Festival Special' : meal}
                          </td>
                          <td>
                            <input type="number" className="form-control" value={pricing.student[meal]} 
                              onChange={(e) => handleNestedChange('student', meal, e.target.value)} min="0" required />
                          </td>
                          <td>
                            <input type="number" className="form-control" value={pricing.guest[meal]} 
                              onChange={(e) => handleNestedChange('guest', meal, e.target.value)} min="0" required />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Fixed Monthly Base Fee</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">₹</span>
                      <input type="number" className="form-control" value={pricing.baseFee} onChange={(e) => handleBaseChange('baseFee', e.target.value)} min="0" required />
                    </div>
                  </div>
                  <div className="col-md-4">
                     <label className="form-label fw-semibold">Min. Rebate Notice (Hrs)</label>
                     <input type="number" className="form-control" value={pricing.rules.noticeHours} onChange={(e) => handleNestedChange('rules', 'noticeHours', e.target.value)} min="0" required />
                  </div>
                  <div className="col-md-4">
                     <label className="form-label fw-semibold">Max Continuous Leave (Days)</label>
                     <input type="number" className="form-control" value={pricing.rules.maxLeaveDays} onChange={(e) => handleNestedChange('rules', 'maxLeaveDays', e.target.value)} min="0" required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold mt-3" disabled={isLoading}>
                  {isLoading ? "Saving Updates..." : "Save Pricing & Rules"}
                </button>
              </form>
            </div>
          </div>

          {/* Pricing Audit Log */}
          <div className="card shadow-sm border-0 rounded-4 mt-4">
             <div className="card-body p-4">
                <h5 className="card-title fw-semibold mb-3">Pricing Audit Log</h5>
                <div className="table-responsive">
                   <table className="table table-sm table-hover mb-0">
                      <thead>
                         <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Admin</th>
                         </tr>
                      </thead>
                      <tbody className="text-muted">
                         {auditLog.map(log => (
                            <tr key={log._id}>
                               <td>{log.date}</td>
                               <td>{log.action}</td>
                               <td>{log.admin}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 bg-light">
             <div className="card-body p-4 text-muted">
                <h5 className="fw-semibold text-dark mb-3">How Dynamic Pricing Works</h5>
                <p>The values set here define the complex billing structure for the mess.</p>
                <ul className="mb-0">
                    <li className="mb-2"><strong>Base Fee:</strong> Charged universally to cover mess staff and maintenance.</li>
                    <li className="mb-2">When a student applies for a <strong>leave/pause</strong>, the Per-Meal amounts are deducted from their bill.</li>
                    <li className="mb-2">Students must provide notice <strong>{pricing.rules.noticeHours} hours</strong> in advance to be eligible for rebates.</li>
                    <li className="mb-2">Rebates are calculated automatically based on these active prices.</li>
                    <li>Updating these prices will only affect <strong>future calculations</strong> and will not alter past generated bills.</li>
                </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricing;