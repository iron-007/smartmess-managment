import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyBreakdown = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    fetchStats();
  }, [selectedMonth, selectedYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/butler/status-stats?month=${selectedMonth}&year=${selectedYear}`);
      if (response.data.success) {
        setData(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div className="card-header bg-white p-4 border-0 pb-0">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Monthly Status Breakdown</h5>
            <p className="text-muted small mb-0">Viewing participation trends for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
          </div>
          
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm border-0 bg-light rounded-pill px-3 fw-bold text-dark"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ minWidth: '130px' }}
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select 
              className="form-select form-select-sm border-0 bg-light rounded-pill px-3 fw-bold text-dark"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card-body p-4 pt-2">
        <div className="d-flex justify-content-end gap-3 mb-3">
          <div className="small d-flex align-items-center">
            <span className="badge rounded-circle p-1 me-2" style={{ backgroundColor: '#FF512F', width: '8px', height: '8px', display: 'inline-block' }}></span>
            Active
          </div>
          <div className="small d-flex align-items-center">
            <span className="badge rounded-circle p-1 me-2" style={{ backgroundColor: '#ef4444', width: '8px', height: '8px', display: 'inline-block' }}></span>
            Inactive
          </div>
        </div>

        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '300px' }}>
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <span className="small text-muted">Loading trends...</span>
          </div>
        ) : (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF512F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FF512F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval={Math.floor(data.length / 7)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Area 
                  type="natural" 
                  dataKey="active" 
                  stroke="#FF512F" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                  name="Active"
                  animationDuration={1500}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="natural" 
                  dataKey="inactive" 
                  stroke="#ef4444" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorInactive)" 
                  name="Inactive"
                  animationDuration={1500}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyBreakdown;
