import React, { useState } from 'react';
import axios from 'axios';

const AccountManagement = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  const handleRequest = async (type) => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await axios.post(`${API_URL}/api/students/${user._id || user.id}/request-account-change`, {
        requestType: type,
        effectiveDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: response.data.message });
      onUpdate();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to submit request.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const isCooldownActive = () => {
    if (!user?.lastRequestDate) return false;
    const last = new Date(user.lastRequestDate);
    const now = new Date();
    const diffHours = (now - last) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const getRemainingCooldown = () => {
    if (!user?.lastRequestDate) return 0;
    const last = new Date(user.lastRequestDate);
    const now = new Date();
    const diffHours = (now - last) / (1000 * 60 * 60);
    return Math.ceil(24 - diffHours);
  };

  if (!user) return (
    <div className="glass-panel shadow-md border-0 mb-4 animate-pulse fade-in">
      <div className="card-body py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    </div>
  );

  return (
    <div className="glass-panel shadow-md border-0 mb-4 overflow-hidden fade-in h-100">
      <div className="card-header border-0 bg-transparent p-4 pb-0">
        <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-sliders me-2 text-primary"></i>Account Control Panel</h5>
      </div>
      <div className="card-body p-4 pt-3">
        <div className={`d-flex align-items-center mb-4 p-3 rounded-4 border transition-all ${user.messStatus === 'Open' ? 'bg-success bg-opacity-10 border-success border-opacity-25' : 'bg-danger bg-opacity-10 border-danger border-opacity-25'}`}>
          <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm ${user.messStatus === 'Open' ? 'bg-success text-white' : 'bg-danger text-white'}`} style={{ width: '48px', height: '48px' }}>
             <i className={`bi ${user.messStatus === 'Open' ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'} fs-4`}></i>
          </div>
          <div>
            <p className="mb-0 text-muted small fw-semibold text-uppercase ls-1">Mess Status</p>
            <h5 className={`mb-0 fw-bold ${user.messStatus === 'Open' ? 'text-success' : 'text-danger'}`}>{user.messStatus === 'Open' ? 'Active & Open' : 'Inactive & Closed'}</h5>
          </div>
        </div>

        {message && (
          <div className={`alert alert-${message.type} small py-2 mb-4 border-0 rounded-3 shadow-sm d-flex align-items-center slide-up`}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-2 fs-5`}></i>
            {message.text}
          </div>
        )}

        <div className="mb-4">
          <label className="form-label small fw-bold text-muted mb-2">Target Effective Date</label>
          <div className="input-group input-group-lg shadow-sm rounded-3">
            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-calendar-event"></i></span>
            <input 
              type="date" 
              className="form-control border-start-0 modern-input"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              disabled={isCooldownActive()}
              style={{ fontSize: '1rem' }}
            />
          </div>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-info-circle-fill text-primary opacity-75 me-1"></i>
            Changes are updated instantly.
          </p>
        </div>

        <div className="d-grid gap-2 mt-2">
          {isCooldownActive() ? (
            <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 d-flex align-items-center">
              <i className="bi bi-hourglass-split fs-3 text-secondary me-3 opacity-75"></i>
              <div>
                <h6 className="mb-1 fw-bold text-dark small">Cooldown Active</h6>
                <p className="mb-0 small text-muted">
                  Next status change available in <strong className="text-primary">{getRemainingCooldown()} hours</strong>.
                </p>
              </div>
            </div>
          ) : user.messStatus === 'Open' ? (
            <button 
              className="btn btn-danger btn-lg fs-6 fw-bold rounded-pill hover-lift py-2 shadow-sm d-flex align-items-center justify-content-center transition-all" 
              onClick={() => handleRequest('Request_Close')}
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-door-closed-fill me-2 fs-5"></i>}
              Turn Mess OFF
            </button>
          ) : (
            <button 
              className="btn btn-success btn-lg fs-6 fw-bold rounded-pill hover-lift py-2 shadow-sm d-flex align-items-center justify-content-center transition-all" 
              onClick={() => handleRequest('Request_Open')}
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-door-open-fill me-2 fs-5"></i>}
              Turn Mess ON
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
