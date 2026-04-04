import React, { useState, useEffect } from "react";

const createEmptyDay = () => ({
  breakfast: { item: "", extra: "" },
  lunch: { item: "", extra: "" },
  dinner: { item: "", extra: "" },
});

const initialMenu = {
  Monday: createEmptyDay(),
  Tuesday: createEmptyDay(),
  Wednesday: createEmptyDay(),
  Thursday: createEmptyDay(),
  Friday: createEmptyDay(),
  Saturday: createEmptyDay(),
  Sunday: createEmptyDay(),
};

const initialTimings = {
  breakfast: { start: "07:30", end: "09:30" },
  lunch: { start: "12:30", end: "14:30" },
  dinner: { start: "19:30", end: "21:30" },
};

// Mock ratings for UI demonstration
const mockRatings = { breakfast: 4.2, lunch: 4.5, dinner: 4.0 };

const MEALS = [
  { key: "breakfast", display: "Breakfast" },
  { key: "lunch", display: "Lunch" },
  { key: "dinner", display: "Dinner" },
];

const MenuManager = () => {
  const [menu, setMenu] = useState(initialMenu);
  const [timings, setTimings] = useState(initialTimings);
  const [status, setStatus] = useState("Draft");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/admin/menu", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.menu) setMenu(data.menu);
          if (data.timings) setTimings(data.timings);
          if (data.status) setStatus(data.status);
        }
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      }
    };
    fetchMenu();
  }, []);

  const handleMenuChange = (day, meal, field, value) => {
    setMenu({
      ...menu,
      [day]: {
        ...menu[day],
        [meal]: { ...menu[day][meal], [field]: value },
      },
    });
  };

  const handleTimingChange = (meal, field, value) => {
    setTimings({
      ...timings,
      [meal]: { ...timings[meal], [field]: value },
    });
  };

  const saveMenu = async (newStatus) => {
    setStatus(newStatus);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { status: newStatus, timings, menu };
      
      const response = await fetch("http://localhost:5000/api/admin/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`Weekly menu saved as ${newStatus}!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to save menu"}`);
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Network error occurred while saving the menu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid py-2">
      
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="nav-title fw-bold m-0">
            <i className="bi bi-journal-richtext me-2"></i>7-Day Menu Manager
          </h2>
          <p className="text-muted small mt-1 mb-0">Configure daily meals and operating hours</p>
        </div>
        <div className="d-flex align-items-center">
          <span className={`badge rounded-pill px-3 py-2 fs-6 shadow-sm ${status === 'Published' ? 'bg-success' : 'bg-warning text-dark'} fw-medium`}>
            {status === 'Published' ? <i className="bi bi-check-circle me-1"></i> : <i className="bi bi-pencil-square me-1"></i>}
            Status: {status}
          </span>
        </div>
      </div>

      {/* MEAL TIMINGS CARD */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
        
        {/* The New Dark Header */}
        <div className="bg-sidebar-dark p-3 px-4">
          <h5 className="fw-bold m-0 text-white">
            <i className="bi bi-clock-history text-white-50 me-2"></i>Operating Hours
          </h5>
        </div>

        {/* The White Input Area */}
        <div className="card-body p-4 bg-white">
          <div className="row g-4">
            {MEALS.map((meal) => (
              <div className="col-md-4" key={meal.key}>
                <label className="form-label fw-bold text-capitalize text-secondary small">{meal.display} Window</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                  <span className="input-group-text bg-light border-0 text-muted"><i className="bi bi-clock"></i></span>
                  <input type="time" className="form-control border-0 modern-input rounded-0 bg-white" value={timings[meal.key].start} onChange={(e) => handleTimingChange(meal.key, 'start', e.target.value)} />
                  <span className="input-group-text bg-light border-0 text-muted fw-semibold px-3">to</span>
                  <input type="time" className="form-control border-0 modern-input rounded-0 bg-white" value={timings[meal.key].end} onChange={(e) => handleTimingChange(meal.key, 'end', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* WEEKLY MENU GRID CARD */}
      <div className="card shadow-sm border-0 rounded-4 mb-5">
        <div className="card-body p-4">
          <form>
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0">
                
                {/* Clean, Light Header instead of heavy dark one */}
                <thead className="border-bottom border-2">
                  <tr>
                    <th style={{ width: "12%" }} className="text-muted fw-bold text-uppercase small pb-3">Day</th>
                    {MEALS.map(meal => (
                       <th key={meal.key} className="pb-3">
                         <div className="d-flex align-items-center">
                           <span className="fw-bold fs-6 text-dark">{meal.display}</span>
                           <span className="badge bg-light text-warning ms-2 border rounded-pill shadow-sm" title="Average student rating">
                             <i className="bi bi-star-fill me-1"></i>{mockRatings[meal.key]}
                           </span>
                         </div>
                       </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Object.keys(menu).map((day) => (
                    <tr key={day} className="border-bottom">
                      <td className="fw-bold text-secondary fs-6 py-4">{day}</td>
                      {MEALS.map((meal) => (
                        <td key={`${day}-${meal.key}`} className="py-4 pe-4">
                          <div className="d-flex flex-column gap-2">
                            {/* Main Item Input */}
                            <input
                              type="text"
                              className="form-control modern-input fw-medium"
                              placeholder={`Main ${meal.key} item...`}
                              value={menu[day][meal.key].item}
                              onChange={(e) => handleMenuChange(day, meal.key, 'item', e.target.value)}
                            />
                            {/* Optional Extra Input */}
                            <div className="input-group input-group-sm shadow-none">
                              <span className="input-group-text bg-transparent border-0 ps-1 pe-2 text-muted">
                                <i className="bi bi-plus-circle-dotted"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control modern-input text-muted"
                                placeholder="Optional extra (e.g. Paneer ₹20)"
                                value={menu[day][meal.key].extra}
                                onChange={(e) => handleMenuChange(day, meal.key, 'extra', e.target.value)}
                              />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div><div className="table-responsive menu-table-wrapper shadow-sm">
              <table className="table table-borderless align-middle mb-0">
                
                {/* The New Dark Header Matching the Sidebar */}
                <thead className="menu-table-header">
                  <tr>
                    <th style={{ width: "12%" }} className="text-uppercase small py-3 ps-4">Day</th>
                    {MEALS.map(meal => (
                       <th key={meal.key} className="py-3">
                         <div className="d-flex align-items-center">
                           <span>{meal.display}</span>
                           {/* Updated badge to look good on dark background */}
                           <span className="badge bg-dark bg-opacity-50 border border-secondary text-warning ms-2 rounded-pill" title="Average student rating">
                             <i className="bi bi-star-fill me-1"></i>{mockRatings[meal.key]}
                           </span>
                         </div>
                       </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Object.keys(menu).map((day, index) => (
                    <tr key={day} className={`menu-table-row ${index !== 6 ? 'border-bottom' : ''}`}>
                      <td className="fw-bold text-secondary fs-6 py-4 ps-4">{day}</td>
                      {MEALS.map((meal) => (
                        <td key={`${day}-${meal.key}`} className="py-4 pe-4">
                          <div className="d-flex flex-column gap-2">
                            <input
                              type="text"
                              className="form-control modern-input fw-medium"
                              placeholder={`Main ${meal.key} item...`}
                              value={menu[day][meal.key].item}
                              onChange={(e) => handleMenuChange(day, meal.key, 'item', e.target.value)}
                            />
                            <div className="input-group input-group-sm shadow-none">
                              <span className="input-group-text bg-transparent border-0 ps-1 pe-2 text-muted">
                                <i className="bi bi-plus-circle-dotted"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control modern-input text-muted"
                                placeholder="Optional extra..."
                                value={menu[day][meal.key].extra}
                                onChange={(e) => handleMenuChange(day, meal.key, 'extra', e.target.value)}
                              />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-light btn-lg fw-bold px-4 rounded-pill border text-muted hover-shadow" 
                onClick={() => saveMenu("Draft")}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save as Draft"}
              </button>
              
              {/* The new Custom Gradient Button */}
              <button 
                type="button" 
                className="btn btn-gradient btn-lg fw-bold px-5 rounded-pill shadow-sm" 
                onClick={() => saveMenu("Published")}
                disabled={isLoading}
              >
                <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                {isLoading ? "Saving..." : "Publish Menu"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default MenuManager;