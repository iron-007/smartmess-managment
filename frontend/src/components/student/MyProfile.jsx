import React from 'react';

const MyProfile = ({ user }) => {
  if (!user) return (
    <div className="glass-panel shadow-sm border-0 mb-4 animate-pulse">
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
    <div className="glass-panel shadow-md border-0 mb-4 overflow-hidden fade-in" style={{ borderRadius: '16px' }}>
      <div className="card-header border-0 p-4" style={{ background: 'var(--sidebar-dark)', color: 'white' }}>
        <div className="d-flex align-items-center">
          <div className="bg-white bg-opacity-10 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center border border-white border-opacity-10" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-person-bounding-box fs-2 text-white"></i>
          </div>
          <div>
            <h4 className="mb-1 fw-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{user.name}</h4>
            <div className="d-flex gap-2 align-items-center mt-1">
              <span className="badge text-white small fw-semibold px-3 rounded-pill shadow-sm" style={{ background: 'var(--brand-gradient)' }}>
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
          <i className="bi bi-shield-check text-success fs-5"></i>
        </div>
        
        <div className="row g-0">
          {profileFields.map((field, index) => (
            <div key={index} className="col-md-6 border-end border-bottom">
              <div className="p-3 px-4 transition-all hover-bg-light">
                <p className="text-muted small mb-1 d-flex align-items-center">
                  <i className={`bi ${field.icon} me-2 opacity-75`} style={{ color: 'var(--brand-primary)' }}></i>
                  {field.label}
                </p>
                <h6 className="mb-0 fw-bold text-dark" style={{ color: '#1f2937 !important' }}>
                  {field.value}
                </h6>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 text-center" style={{ backgroundColor: '#f8fafc' }}>
           <small className="text-muted">
             <i className="bi bi-info-circle-fill me-1" style={{ color: 'var(--brand-secondary)' }}></i>
             Identity verified by SmartMess System
           </small>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
