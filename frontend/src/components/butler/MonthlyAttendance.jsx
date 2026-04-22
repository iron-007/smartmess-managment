import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MonthlyAttendance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    year: new Date().getFullYear().toString()
  });

  const fetchMonthlyStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/butler/attendance?month=${filter.month}&year=${filter.year}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, [filter]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title fw-bold mb-0">Monthly Breakdown</h5>
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm w-auto" 
              value={filter.month}
              onChange={(e) => setFilter({...filter, month: e.target.value})}
            >
              {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                <option key={m} value={m}>{new Date(2022, parseInt(m)-1).toLocaleString('default', { month: 'short' })}</option>
              ))}
            </select>
            <select 
              className="form-select form-select-sm w-auto" 
              value={filter.year}
              onChange={(e) => setFilter({...filter, year: e.target.value})}
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <span className="ms-2 small text-muted">Analyzing aggregation...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-5 text-muted">No attendance data for this period.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Date</th>
                  <th className="text-center">Breakfast</th>
                  <th className="text-center">Lunch</th>
                  <th className="text-center">Dinner</th>
                  <th className="text-end">Day Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((day, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', weekday: 'short' })}</td>
                    <td className="text-center">{day.breakfastCount}</td>
                    <td className="text-center">{day.lunchCount}</td>
                    <td className="text-center">{day.dinnerCount}</td>
                    <td className="text-end fw-bold text-primary">
                      {day.breakfastCount + day.lunchCount + day.dinnerCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyAttendance;
