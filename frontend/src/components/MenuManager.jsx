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

  // Fetch initial menu data on component mount
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
        method: "PUT", // Assuming you use PUT for updates
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`Weekly menu saved as ${newStatus}!`);
      } else {
        try {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Failed to save menu"}`);
        } catch (parseError) {
          alert(`Server Error: ${response.status} ${response.statusText}. Please check if the backend route exists.`);
        }
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Network error occurred while saving the menu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary m-0">7-Day Menu Manager</h2>
        <div className="d-flex align-items-center gap-3">
          <span className={`badge ${status === 'Published' ? 'bg-success' : 'bg-warning text-dark'} fs-6`}>
            Status: {status}
          </span>
        </div>
      </div>

      {/* Meal Timings Configuration */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-semibold mb-3">Meal Timings</h5>
          <div className="row g-3">
            {MEALS.map((meal) => (
              <div className="col-md-4" key={meal.key}>
                <label className="form-label fw-semibold text-capitalize text-muted small">{meal.display} Window</label>
                <div className="input-group">
                  <input type="time" className="form-control" value={timings[meal.key].start} onChange={(e) => handleTimingChange(meal.key, 'start', e.target.value)} />
                  <span className="input-group-text">to</span>
                  <input type="time" className="form-control" value={timings[meal.key].end} onChange={(e) => handleTimingChange(meal.key, 'end', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          <form>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: "15%" }}>Day</th>
                    {MEALS.map(meal => (
                       <th key={meal.key}>
                         {meal.display} <span className="badge bg-secondary ms-1 fw-normal" title="Average student rating">⭐ {mockRatings[meal.key]}</span>
                       </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(menu).map((day) => (
                    <tr key={day}>
                      <td className="fw-semibold bg-light">{day}</td>
                      {MEALS.map((meal) => (
                        <td key={`${day}-${meal.key}`}>
                          <div className="d-flex flex-column gap-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Main ${meal.key} item...`}
                              value={menu[day][meal.key].item}
                              onChange={(e) => handleMenuChange(day, meal.key, 'item', e.target.value)}
                            />
                            <input
                              type="text"
                              className="form-control form-control-sm text-muted"
                              placeholder="Optional extra (e.g. Paneer ₹20)"
                              value={menu[day][meal.key].extra}
                              onChange={(e) => handleMenuChange(day, meal.key, 'extra', e.target.value)}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button 
                type="button" 
                className="btn btn-light btn-lg fw-semibold px-4 border" 
                onClick={() => saveMenu("Draft")}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save as Draft"}
              </button>
              <button 
                type="button" 
                className="btn btn-success btn-lg fw-semibold px-5" 
                onClick={() => saveMenu("Published")}
                disabled={isLoading}
              >
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