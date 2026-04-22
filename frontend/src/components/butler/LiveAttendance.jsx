import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const LiveAttendance = () => {
  const [stats, setStats] = useState({
    breakfastCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    totalServed: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchLiveStats = async () => {
    try {
      const response = await api.get('/api/butler/live-attendance');
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching live stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const mealStats = [
    { label: 'Breakfast', count: stats.breakfastCount, icon: 'bi-sun-fill', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.1)' },
    { label: 'Lunch', count: stats.lunchCount, icon: 'bi-brightness-high-fill', color: '#FF5C00', bg: 'rgba(255, 92, 0, 0.1)' },
    { label: 'Dinner', count: stats.dinnerCount, icon: 'bi-moon-stars-fill', color: '#4E54C8', bg: 'rgba(78, 84, 200, 0.1)' }
  ];

  return (
    <div className="mb-4">
      <div className="row g-3">
        {mealStats.map((meal, idx) => (
          <div key={idx} className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ borderLeft: `5px solid ${meal.color}` }}>
              <div className="card-body p-4 d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: meal.bg }}>
                  <i className={`bi ${meal.icon} fs-4`} style={{ color: meal.color }}></i>
                </div>
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-0">{meal.label}</p>
                  <h2 className="mb-0 fw-bold">{meal.count}</h2>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-sidebar-dark text-white overflow-hidden position-relative">
             {/* Decorative Background Pattern */}
             <div className="position-absolute top-0 end-0 p-3 opacity-25">
                <i className="bi bi-people-fill display-4"></i>
             </div>
             <div className="card-body p-4 position-relative">
                <p className="small fw-bold text-uppercase mb-0 opacity-100 text-white">Total Served</p>
                <h2 className="mb-0 fw-bold display-6 text-white">{stats.totalServed}</h2>
                <p className="extra-small mb-0 opacity-75 mt-1 text-white-50">Meals served so far today</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAttendance;
