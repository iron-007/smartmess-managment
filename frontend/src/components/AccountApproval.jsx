import React, { useState, useEffect } from 'react';

const AccountApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/admin/approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch account requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id) => {
    if (!window.confirm(`Are you sure you want to approve this request?`)) return;
    
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/admin/approvals/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        // Remove the processed user from the UI instantly
        setRequests(requests.filter(req => req._id !== id));
      } else {
        alert(data.message || `Failed to approve request.`);
      }
    } catch (error) {
      console.error(`Error processing approval:`, error);
      alert("An error occurred. Please try again.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

  return (
    <div className="container-fluid py-2">
      {/* PAGE HEADER */}
      <div className="mb-4">
        <h2 className="nav-title fw-bold m-0">
          <i className="bi bi-shield-check me-2"></i>Account Approvals
        </h2>
        <p className="text-muted small mt-1 mb-0">Manage student requests to open or close their mess accounts.</p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
        <div className="bg-sidebar-dark p-3 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#16181d' }}>
           <h5 className="fw-bold m-0 text-white">
             <i className="bi bi-inbox-fill text-white-50 me-2"></i>Pending Requests
           </h5>
           <span className="badge bg-light text-dark rounded-pill shadow-sm px-3 py-2">
             {requests.length} Pending
           </span>
        </div>

        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 small text-uppercase text-secondary">Student</th>
                  <th className="py-3 px-3 small text-uppercase text-secondary">Account No.</th>
                  <th className="py-3 px-3 small text-uppercase text-secondary">Current Status</th>
                  <th className="py-3 px-3 small text-uppercase text-secondary">Requested Action</th>
                  <th className="py-3 px-4 small text-uppercase text-secondary text-end">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : requests.length > 0 ? (
                  requests.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr className={expandedUserId === user._id ? 'bg-light' : ''}>
                        <td className="fw-bold text-dark py-3 px-4">
                          <div className="d-flex align-items-center gap-2">
                            <button 
                              className="btn btn-sm btn-light rounded-circle border p-1 d-flex align-items-center justify-content-center"
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => toggleExpand(user._id)}
                              title="View History"
                            >
                              <i className={`bi bi-chevron-${expandedUserId === user._id ? 'up' : 'down'} small`}></i>
                            </button>
                            {user.name}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-secondary fw-medium">{user.messAccount}</td>
                        <td className="py-3 px-3">
                          <span className={`badge rounded-pill ${user.messStatus === 'Open' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25'}`}>
                            <i className={`bi bi-${user.messStatus === 'Open' ? 'check-circle' : 'dash-circle'} me-1`}></i>
                            {user.messStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`badge rounded-pill ${user.messStatusRequest === 'Request_Open' ? 'bg-primary bg-opacity-10 text-primary border border-primary' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`}>
                            {user.messStatusRequest === 'Request_Open' ? 'Wants to OPEN' : 'Wants to CLOSE'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-sm"
                              onClick={() => handleAction(user._id)}
                            >
                              <i className="bi bi-check2 me-1"></i> Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* EXPANDABLE HISTORY LOG ROW */}
                      {expandedUserId === user._id && (
                        <tr>
                          <td colSpan="5" className="p-0 border-0">
                            <div className="bg-light p-4 border-bottom animate__animated animate__fadeIn">
                              <h6 className="fw-bold text-secondary mb-3"><i className="bi bi-clock-history me-2"></i>Account Status History</h6>
                              {user.messStatusLog && user.messStatusLog.length > 0 ? (
                                <ul className="list-group list-group-flush border rounded-3 overflow-hidden shadow-sm">
                                  {[...user.messStatusLog].reverse().map((log, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center bg-white">
                                      <div>
                                        <strong className="text-dark d-block">{log.action}</strong>
                                        <small className="text-muted">{log.remark}</small>
                                      </div>
                                      <span className="badge bg-light text-secondary border">
                                        {new Date(log.date).toLocaleString()}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted small mb-0">No history available for this account.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      <i className="bi bi-shield-check fs-1 d-block mb-3 opacity-25"></i>
                      <h5 className="fw-medium">All caught up!</h5>
                      <p className="small mb-0">There are currently no pending account requests.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountApproval;