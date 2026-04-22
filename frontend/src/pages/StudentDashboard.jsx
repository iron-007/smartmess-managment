import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DuesSection from '../components/student/DuesSection';
import ConsumptionGrid from '../components/student/ConsumptionGrid';
import TodayMenu from '../components/student/TodayMenu';
import NoticeFeed from '../components/student/NoticeFeed';
import WeeklyMenuSection from '../components/student/WeeklyMenuSection';
import AccountManagement from '../components/student/AccountManagement';
import MyProfile from '../components/student/MyProfile';

const StudentDashboard = () => {
  const [data, setData] = useState({
    dues: {},
    consumption: [],
    menu: null,
    weeklyMenu: null,
    notices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Use allSettled to handle partial failures
      const results = await Promise.allSettled([
        axios.get(`${API_URL}/api/students/me/dues`, { headers }),
        axios.get(`${API_URL}/api/students/me/consumption/monthly`, { headers }),
        axios.get(`${API_URL}/api/menu/today`, { headers }),
        axios.get(`${API_URL}/api/menu`, { headers }),
        axios.get(`${API_URL}/api/notices`, { headers }),
        axios.get(`${API_URL}/api/auth/me`, { headers })
      ]);

      const [duesRes, consumptionRes, menuRes, weeklyMenuRes, noticesRes, userRes] = results;

      setData({
        dues: duesRes.status === 'fulfilled' ? duesRes.value.data : {},
        consumption: consumptionRes.status === 'fulfilled' ? (Array.isArray(consumptionRes.value.data) ? consumptionRes.value.data : []) : [],
        menu: menuRes.status === 'fulfilled' ? menuRes.value.data : null,
        weeklyMenu: weeklyMenuRes.status === 'fulfilled' ? weeklyMenuRes.value.data : null,
        notices: noticesRes.status === 'fulfilled' ? (noticesRes.value.data.notices || []) : [],
        user: userRes.status === 'fulfilled' ? userRes.value.data.user : JSON.parse(localStorage.getItem('user'))
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger mt-4" role="alert">
      {error}
    </div>
  );

  return (
    <div className="fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold text-dark">Dashboard</h2>
          <p className="text-muted">Overview of your mess account and consumption.</p>
        </div>
      </div>

      {/* Row 0: Profile */}
      <div className="row mb-4">
        <div className="col-12">
          <MyProfile user={data.user} />
        </div>
      </div>

      <div className="row g-4">
        {/* Row 1: Dues and Today's Menu */}
        <div className="col-lg-6 col-xl-4">
          <DuesSection dues={data.dues} />
        </div>
        <div className="col-lg-6 col-xl-4">
          <TodayMenu menu={data.menu} timings={data.weeklyMenu?.timings} />
        </div>
        <div className="col-lg-12 col-xl-4">
          <AccountManagement user={data.user} onUpdate={fetchData} />
        </div>

        {/* Row 2: Consumption Grid and Notices */}
        <div className="col-lg-12 col-xl-8">
          <ConsumptionGrid consumption={data.consumption} />
        </div>
        <div className="col-lg-12 col-xl-4">
          <NoticeFeed notices={data.notices} />
        </div>

        {/* Row 3: Full Weekly Menu */}
        <div className="col-12">
          <WeeklyMenuSection menu={data.weeklyMenu} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
