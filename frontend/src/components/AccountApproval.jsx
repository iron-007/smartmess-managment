import React, { useState, useEffect } from 'react';

const AccountApproval = () => {
  const [requests, setRequests] = useState([]);
  const [dailyRequests, setDailyRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [expandedUserId, setExpandedUserId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const [accRes, dailyRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/butler/approvals`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/butler/daily-requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/butler/daily-requests/history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const accData = await accRes.json();
      const dailyData = await dailyRes.json();
      const historyData = await historyRes.json();
      
      if (accData.success) setRequests(accData.users);
      if (dailyData.success) setDailyRequests(dailyData.requests);
      if (historyData.success) setHistory(historyData.requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveAccount = async (id) => {
    if (!window.confirm(`Approve this permanent account change?`)) return;
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/butler/approvals/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if ((await response.json()).success) {
        setRequests(requests.filter(req => req._id !== id));
      }
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleProcessDaily = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this request?`)) return;
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const url = action === 'APPROVE' 
        ? `${API_URL}/api/butler/daily-requests/${id}/approve`
        : `${API_URL}/api/butler/daily-requests/${id}`;
        
      const response = await fetch(url, {
        method: action === 'APPROVE' ? 'PUT' : 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if ((await response.json()).success) {
        setDailyRequests(dailyRequests.filter(req => req._id !== id));
        fetchData(); // Refresh history
      }
    } catch (error) {
      console.error("Error processing daily request:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="nav-title fw-bold m-0">
            <i className="bi bi-shield-check me-2"></i>Approvals & History
          </h2>
          <p className="text-muted small mt-1 mb-0">Manage and track student status requests.</p>
        </div>
        <div className="btn-group shadow-sm rounded-pill p-1 bg-white">
          <button 
            className={`btn rounded-pill px-4 fw-bold ${activeTab === 'pending' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`btn rounded-pill px-4 fw-bold ${activeTab === 'history' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="row g-4">
          {/* SECTION 1: PERMANENT ACCOUNT CHANGES */}
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
              <div className="bg-dark p-3 px-4 d-flex justify-content-between align-items-center">
                 <h5 className="fw-bold m-0 text-white">Permanent Account Requests</h5>
                 <span className="badge bg-light text-dark rounded-pill">{requests.length} Pending</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-3 py-3">Account</th>
                        <th className="px-3 py-3">Current</th>
                        <th className="px-3 py-3">Wants to</th>
                        <th className="px-4 py-3 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length > 0 ? requests.map(user => (
                        <tr key={user._id}>
                          <td className="px-4">
                            <button className="btn btn-sm btn-light border rounded-circle me-2" onClick={() => toggleExpand(user._id)}>
                              <i className={`bi bi-chevron-${expandedUserId === user._id ? 'up' : 'down'}`}></i>
                            </button>
                            {user.name}
                          </td>
                          <td className="px-3">{user.messAccount}</td>
                          <td className="px-3"><span className="badge bg-secondary">{user.messStatus}</span></td>
                          <td className="px-3">
                            <span className={`badge ${user.messStatusRequest === 'Request_Open' ? 'bg-primary' : 'bg-warning'}`}>
                              {user.messStatusRequest === 'Request_Open' ? 'OPEN' : 'CLOSE'}
                            </span>
                          </td>
                          <td className="px-4 text-end">
                            <button className="btn btn-sm btn-success rounded-pill px-3 fw-bold" onClick={() => handleApproveAccount(user._id)}>Approve</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="text-center p-4 text-muted">No pending account changes.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DAILY STATUS REQUESTS */}
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="bg-primary p-3 px-4 d-flex justify-content-between align-items-center">
                 <h5 className="fw-bold m-0 text-white">Daily ON/OFF Requests</h5>
                 <span className="badge bg-light text-primary rounded-pill">{dailyRequests.length} Pending</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-3 py-3">Account</th>
                        <th className="px-3 py-3">Date</th>
                        <th className="px-3 py-3">Request</th>
                        <th className="px-4 py-3 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyRequests.length > 0 ? dailyRequests.map(req => (
                        <tr key={req._id}>
                          <td className="px-4 fw-bold">{req.student?.name}</td>
                          <td className="px-3">{req.student?.messAccount}</td>
                          <td className="px-3 fw-medium text-dark">{new Date(req.date).toLocaleDateString()}</td>
                          <td className="px-3">
                            <span className={`badge ${req.action === 'OPEN' ? 'bg-success' : 'bg-danger'}`}>
                              {req.action}
                            </span>
                          </td>
                          <td className="px-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onClick={() => handleProcessDaily(req._id, 'APPROVE')}>Approve</button>
                              <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={() => handleProcessDaily(req._id, 'REJECT')}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="text-center p-4 text-muted">No pending daily requests.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="bg-secondary p-3 px-4 d-flex justify-content-between align-items-center">
             <h5 className="fw-bold m-0 text-white">Daily Request History (Last 50)</h5>
             <span className="badge bg-light text-secondary rounded-pill">{history.length} Records</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-3 py-3">Account</th>
                    <th className="px-3 py-3">Target Date</th>
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-end">Processed At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? history.map(req => (
                    <tr key={req._id}>
                      <td className="px-4">{req.student?.name}</td>
                      <td className="px-3">{req.student?.messAccount}</td>
                      <td className="px-3 text-dark">{new Date(req.date).toLocaleDateString()}</td>
                      <td className="px-3">
                        <span className={`badge ${req.action === 'OPEN' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${req.action === 'OPEN' ? 'text-success' : 'text-danger'}`}>
                          {req.action}
                        </span>
                      </td>
                      <td className="px-3">
                        <span className={`badge rounded-pill ${req.status === 'APPROVED' ? 'bg-success' : 'bg-danger'} px-3`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 text-end text-muted small">
                        <div>{new Date(req.updatedAt).toLocaleString()}</div>
                        <span className="badge bg-info text-dark" style={{ fontSize: '0.7rem' }}>{req.mealType || 'All'}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center p-5 text-muted">No history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountApproval;