import React from 'react';

const NoticeFeed = ({ notices }) => {
  return (
    <div className="glass-panel shadow-md border-0 h-100 fade-in">
      <div className="card-header border-0 bg-transparent p-4 pb-0">
         <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-megaphone me-2 text-warning"></i>Notice Board</h5>
      </div>
      <div className="card-body p-4">
        {(!notices || notices.length === 0) ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 mb-2 opacity-50"></i>
            <p className="mb-0">No active notices.</p>
          </div>
        ) : (
          <div className="overflow-auto pe-2" style={{ maxHeight: '400px' }}>
            {notices.map((notice, index) => (
              <div key={index} className="mb-3 p-3 rounded-4 bg-light border border-light transition-all hover-lift">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0 text-dark" style={{ lineHeight: '1.4' }}>{notice.title}</h6>
                  {notice.priority === 'High' && <span className="badge bg-danger ms-2 rounded-pill shadow-sm"><i className="bi bi-exclamation-circle me-1"></i>High</span>}
                </div>
                <div className="d-flex align-items-center mb-2 text-muted small">
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(notice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {notice.content}
                </p>
                {notice.attachmentUrl && (
                  <a 
                    href={`http://localhost:5000/${notice.attachmentUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary mt-3 py-1 px-3 rounded-pill fw-medium d-inline-flex align-items-center"
                  >
                    <i className="bi bi-paperclip me-1"></i> View Attachment
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeFeed;
