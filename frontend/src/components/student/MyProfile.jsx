import React from 'react';

const MyProfile = ({ user }) => {
  if (!user) return (
    <div className="card shadow-sm border-0 mb-4 animate-pulse">
      <div className="card-body p-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    </div>
  );

  const profileFields = [
    { label: 'Full Name', value: user.name, icon: 'bi-person-fill' },
    { label: 'URN', value: user.urn || 'N/A', icon: 'bi-hash' },
    { label: 'CRN', value: user.crn || 'N/A', icon: 'bi-card-text' },
    { label: 'Department', value: user.department || 'N/A', icon: 'bi-building' },
    { label: 'Batch', value: user.batch || 'N/A', icon: 'bi-calendar-event' },
    { label: 'Mess Account', value: user.messAccount || 'N/A', icon: 'bi-wallet2' },
    { label: 'Hostel', value: user.hostel || 'N/A', icon: 'bi-house-door' },
    { label: 'Year', value: user.year ? `${user.year} Year` : 'N/A', icon: 'bi-mortarboard' }
  ];

  return (
    <div className="card shadow-sm border-0 mb-4 overflow-hidden shadow-hover" style={{ borderRadius: '15px' }}>
      <div className="card-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #16181d 0%, #2c313c 100%)', color: 'white' }}>
        <div className="d-flex align-items-center">
          <div className="bg-white bg-opacity-10 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center border border-white border-opacity-10" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-person-bounding-box fs-2 text-white"></i>
          </div>
          <div>
            <h4 className="mb-1 fw-bold text-white">{user.name}</h4>
            <div className="d-flex gap-2 align-items-center">
              <span className="badge bg-primary bg-opacity-75 text-white small fw-semibold px-3 rounded-pill">
                {user.role?.toUpperCase() || 'STUDENT'}
              </span>
              <span className="text-white-50 small"><i className="bi bi-dot"></i> {user.email}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body p-0 bg-white">
        <div className="p-3 px-4 bg-light border-bottom d-flex align-items-center justify-content-between">
          <span className="text-muted small fw-bold text-uppercase ls-1">Profile Details</span>
          <i className="bi bi-shield-check text-success"></i>
        </div>
        
        <div className="row g-0">
          {profileFields.map((field, index) => (
            <div key={index} className="col-md-6 border-end border-bottom">
              <div className="p-3 px-4 transition-all hover-bg-light">
                <p className="text-muted small mb-1 d-flex align-items-center">
                  <i className={`bi ${field.icon} me-2 text-primary opacity-75`}></i>
                  {field.label}
                </p>
                <h6 className="mb-0 fw-bold text-dark" style={{ color: '#2d3436 !important' }}>
                  {field.value}
                </h6>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 text-center bg-light bg-opacity-50">
           <small className="text-muted">
             <i className="bi bi-info-circle-fill me-1 text-info"></i>
             Identity verified by SmartMess System
           </small>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
