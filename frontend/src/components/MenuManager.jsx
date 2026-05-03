import React, { useState, useEffect } from "react";
import api from "../utils/api";

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
  { key: "breakfast", display: "Breakfast", icon: "bi-sunrise" },
  { key: "lunch", display: "Lunch", icon: "bi-sun" },
  { key: "dinner", display: "Dinner", icon: "bi-moon-stars" },
];

const MenuManager = () => {
  const [menu, setMenu] = useState(initialMenu);
  const [timings, setTimings] = useState(initialTimings);
  const [status, setStatus] = useState("Draft");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get("/api/admin/menu");
        const data = response.data;
        if (data.menu) setMenu(data.menu);
        if (data.timings) setTimings(data.timings);
        if (data.status) setStatus(data.status);
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
      const payload = { status: newStatus, timings, menu };
      const response = await api.put("/api/admin/menu", payload);

      if (response.status === 200) {
        alert(`Weekly menu saved as ${newStatus}!`);
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Network error occurred while saving the menu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid py-2 fade-in">
      
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="nav-title fw-bold m-0 text-gradient">
            <i className="bi bi-journal-richtext me-2"></i>7-Day Menu Manager
          </h2>
          <p className="text-muted small mt-1 mb-0">Configure daily meals, specials, and operating hours</p>
        </div>
        <div className="d-flex align-items-center">
          <span className={`badge rounded-pill px-4 py-2 fs-6 shadow-sm ${status === 'Published' ? 'bg-success' : 'bg-warning text-dark'} fw-bold`}>
            {status === 'Published' ? <i className="bi bi-check-circle-fill me-2"></i> : <i className="bi bi-pencil-square me-2"></i>}
            Status: {status}
          </span>
        </div>
      </div>

      {/* MEAL TIMINGS CARD */}
      <div className="glass-panel shadow-sm border-0 mb-4 overflow-hidden">
        <div className="p-3 px-4" style={{ background: 'var(--brand-gradient)' }}>
          <h5 className="fw-bold m-0 text-white">
            <i className="bi bi-clock-history me-2 opacity-75"></i>Operating Hours
          </h5>
        </div>

        <div className="card-body p-4 bg-transparent">
          <div className="row g-4">
            {MEALS.map((meal) => (
              <div className="col-md-4" key={meal.key}>
                <label className="form-label fw-bold text-capitalize text-dark small">
                  <i className={`bi ${meal.icon} me-2 text-gradient`}></i>{meal.display} Window
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input 
                    type="time" 
                    className="form-control modern-input shadow-sm p-2 text-center" 
                    value={timings[meal.key].start} 
                    onChange={(e) => handleTimingChange(meal.key, 'start', e.target.value)} 
                  />
                  <span className="text-muted fw-bold small">TO</span>
                  <input 
                    type="time" 
                    className="form-control modern-input shadow-sm p-2 text-center" 
                    value={timings[meal.key].end} 
                    onChange={(e) => handleTimingChange(meal.key, 'end', e.target.value)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* WEEKLY MENU GRID CARD */}
      <div className="glass-panel shadow-sm border-0 mb-5 overflow-hidden">
        <div className="p-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ background: 'var(--sidebar-dark)' }}>
          <h5 className="fw-bold m-0 text-white">
            <i className="bi bi-grid-3x3-gap me-2 opacity-75"></i>Weekly Planner
          </h5>
          <div className="d-flex align-items-center gap-2">
            <span className="text-white small fw-medium">Select Meal:</span>
            <select 
              className="form-select form-select-sm fw-bold border-0" 
              value={selectedMeal} 
              onChange={(e) => setSelectedMeal(e.target.value)}
              style={{ borderRadius: '8px', cursor: 'pointer', width: '140px' }}
            >
              {MEALS.map(meal => (
                <option key={meal.key} value={meal.key}>{meal.display}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body p-4 bg-transparent">
          <form>
            <div className="d-flex flex-column gap-3">
              {Object.keys(menu).map((day) => (
                <div key={day} className="bg-white p-3 rounded-4 border shadow-sm">
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--brand-primary)' }}>{day}</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="input-group shadow-sm rounded-3">
                      <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-egg-fried"></i></span>
                      <input
                        type="text"
                        className="form-control modern-input fw-bold border-start-0 ps-0 bg-white"
                        placeholder={`Main ${selectedMeal}...`}
                        value={menu[day][selectedMeal].item}
                        onChange={(e) => handleMenuChange(day, selectedMeal, 'item', e.target.value)}
                      />
                    </div>
                    <div className="input-group rounded-3">
                      <span className="input-group-text bg-light border-0 ps-3 pe-2 text-muted">
                        <i className="bi bi-plus-circle-dotted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control modern-input text-muted bg-light border-0"
                        placeholder="Extras / Add-ons..."
                        value={menu[day][selectedMeal].extra}
                        onChange={(e) => handleMenuChange(day, selectedMeal, 'extra', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-grid gap-3 d-md-flex justify-content-md-end mt-4">
              <button 
                type="button" 
                className="btn btn-light fw-bold px-4 py-2 rounded-pill shadow-sm text-dark hover-shadow" 
                onClick={() => saveMenu("Draft")}
                disabled={isLoading}
              >
                <i className="bi bi-save2 me-2"></i>
                {isLoading ? "Saving..." : "Save Draft"}
              </button>
              
              <button 
                type="button" 
                className="btn btn-gradient fw-bold px-5 py-2 rounded-pill shadow-md" 
                onClick={() => saveMenu("Published")}
                disabled={isLoading}
              >
                <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                {isLoading ? "Publishing..." : "Publish Menu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuManager;