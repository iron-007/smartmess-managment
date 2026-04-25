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
    <div className="glass-panel shadow-md border-0 mb-4 overflow-hidden fade-in h-100" style={{ borderRadius: '16px' }}>
      <div className="card-header border-0 p-4" style={{ background: 'var(--sidebar-dark)', color: 'white' }}>
        <div className="d-flex align-items-center">
          <div className="bg-white bg-opacity-10 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center border border-white border-opacity-10 shadow-sm transition-all hover-lift" style={{ width: '72px', height: '72px' }}>
            <i className="bi bi-person-bounding-box fs-1 text-white"></i>
          </div>
          <div>
            <h3 className="mb-1 fw-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{user.name}</h3>
            <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
              <span className="badge text-white small fw-bold px-3 py-1 rounded-pill shadow-sm" style={{ background: 'var(--brand-gradient)' }}>
                {user.role?.toUpperCase() || 'STUDENT'}
              </span>
              <span className="text-white-50 small bg-white bg-opacity-10 px-2 py-1 rounded-pill"><i className="bi bi-envelope-fill me-1"></i> {user.email}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body p-0 bg-white">
        <div className="p-3 px-4 bg-light border-bottom d-flex align-items-center justify-content-between">
          <span className="text-muted small fw-bold text-uppercase ls-1"><i className="bi bi-person-vcard me-2"></i>Profile Details</span>
          <i className="bi bi-shield-fill-check text-success fs-5" title="Verified Identity"></i>
        </div>
        
        <div className="row g-0">
          {profileFields.map((field, index) => (
            <div key={index} className={`col-md-6 ${index % 2 === 0 ? 'border-end' : ''} border-bottom border-light`}>
              <div className="p-3 px-4 transition-all hover-bg-light" style={{ cursor: 'default' }}>
                <p className="text-muted small mb-1 d-flex align-items-center fw-medium">
                  <i className={`bi ${field.icon} me-2 fs-6 opacity-75`} style={{ color: 'var(--brand-primary)' }}></i>
                  {field.label}
                </p>
                <h6 className="mb-0 fw-bold text-dark ps-4" style={{ color: '#1f2937 !important' }}>
                  {field.value}
                </h6>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 text-center bg-light">
           <small className="text-muted fw-medium">
             <i className="bi bi-info-circle-fill me-1" style={{ color: 'var(--brand-secondary)' }}></i>
             Identity verified by SmartMess System
           </small>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
